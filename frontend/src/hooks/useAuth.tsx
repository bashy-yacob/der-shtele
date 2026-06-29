"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// קוראים דרך proxy routes יחסיים (same-origin) ולא ישירות לבק — כך ההתחברות
// לא נחסמת ע"י NetFree אצל משתמשים חרדים.
import type { JobField } from "@/types";

const TOKEN_KEY = "ds_token";
// חותמת הפעילות האחרונה — מניעה את ניתוק חוסר-הפעילות (sliding window).
const LAST_ACTIVE_KEY = "ds_last_active";
// אחרי 3 ימים ללא שימוש המשתמש מנותק ונדרש להתחבר מחדש.
const IDLE_LIMIT_MS = 3 * 24 * 60 * 60 * 1000;
// לא מעדכנים את חותמת הפעילות ב-localStorage יותר מפעם בדקה (חיסכון בכתיבות).
const TOUCH_THROTTLE_MS = 60 * 1000;

/** מנקה את הסשן המקומי לחלוטין (טוקן + חותמת פעילות). */
function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
}

/** האם עברה תקופת חוסר-הפעילות מאז השימוש האחרון. */
function isIdleExpired(): boolean {
  const raw = localStorage.getItem(LAST_ACTIVE_KEY);
  if (!raw) return false;
  const last = Number(raw);
  return Number.isFinite(last) && Date.now() - last > IDLE_LIMIT_MS;
}

/** מאריך את חלון הפעילות — נקרא בכניסה ובכל פעילות משתמש. */
function touchLastActive() {
  localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
}

/** פרטי הפרופיל שהמשתמש ממלא מרצון — משמשים לדיוור מותאם אישית. */
export interface ProfileFields {
  phone?: string | null;
  city?: string | null;
  preferredField?: JobField | null;
  yearsExperience?: number | null;
}

export interface AuthUser extends ProfileFields {
  id: string;
  email: string;
  fullName: string;
  role: string;
  optInMarketing?: boolean;
  emailVerified?: boolean;
  // לתזכורת ה-opt-in החודשית (משתמשי Google שלא אישרו דיוור)
  optInPromptedAt?: string | null;
  authProvider?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    fullName: string;
    email: string;
    password: string;
    optInMarketing: boolean;
  }) => Promise<void>;
  /** הרשמת מעסיק עצמית — נפתח חשבון pending; מתחבר מיד למסך ההמתנה. */
  registerEmployer: (body: {
    companyName: string;
    contactName: string;
    contactPhone: string;
    email: string;
    password: string;
    optInMarketing: boolean;
  }) => Promise<void>;
  logout: () => void;
  updateMarketing: (optInMarketing: boolean) => Promise<void>;
  /** עדכון פרטי הפרופיל לדיוור מותאם (עיר, תחום, טלפון, שנות ניסיון). */
  updateProfile: (fields: ProfileFields) => Promise<void>;
  /** מסמן בשרת שתזכורת ה-opt-in הוצגה (מאפס את הספירה ל-~30 יום הבאים). */
  markOptInPrompted: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * מצב ההתחברות מנוהל כ-state יחיד ומשותף (Context) כדי שכל הצרכנים —
 * הנאבבר, הדשבורד, הטפסים — יתעדכנו מיד אחרי התחברות/הרשמה/יציאה, בלי תלות
 * ברענון או ברימאונט של הקומפוננטה.
 */
function useAuthState(): AuthContextValue {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const token = useCallback(
    () =>
      typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY),
    [],
  );

  // טוען את המשתמש המחובר לפי ה-token
  useEffect(() => {
    const t = token();
    if (!t) {
      setLoading(false);
      return;
    }
    // ניתוק חוסר-פעילות: אם עברו 3 ימים מאז השימוש האחרון — לנקות ולא להתחבר.
    if (isIdleExpired()) {
      clearSession();
      setLoading(false);
      return;
    }
    // טוקן קיים מלפני השינוי (ללא חותמת פעילות) — מאתחלים כעת (תקופת חסד),
    // כך שפריסה לא מנתקת את כל המשתמשים המחוברים.
    touchLastActive();
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${t}` },
    })
      // בודקים res.ok לפני json() — אחרת גוף שגיאה (HTML/401) זורק ונבלע בשקט.
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.success) {
          setUser({
            id: res.data.userId,
            email: res.data.email,
            fullName: res.data.fullName ?? "",
            role: res.data.role,
            optInMarketing: res.data.optInMarketing,
            emailVerified: res.data.emailVerified,
            phone: res.data.phone ?? null,
            city: res.data.city ?? null,
            preferredField: res.data.preferredField ?? null,
            yearsExperience: res.data.yearsExperience ?? null,
            optInPromptedAt: res.data.optInPromptedAt ?? null,
            authProvider: res.data.authProvider,
          });
          touchLastActive();
        } else {
          // טוקן לא תקף (פג בשרת / נדחה) — לנקות כדי לא להשאיר טוקן מת ב-localStorage.
          clearSession();
        }
      })
      // כשל רשת זמני — לא מנתקים (משאירים את הטוקן לניסיון הבא).
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [token]);

  // מעקב פעילות + אכיפת חוסר-פעילות + סנכרון בין טאבים — רק כשמחובר.
  useEffect(() => {
    if (!user) return;

    let lastTouch = 0;
    const touch = () => {
      const now = Date.now();
      if (now - lastTouch > TOUCH_THROTTLE_MS) {
        lastTouch = now;
        touchLastActive();
      }
    };
    const onActivity = () => touch();
    window.addEventListener("mousedown", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("scroll", onActivity, { passive: true });

    // בחזרה לטאב: לבדוק קודם אם פג חלון חוסר-הפעילות (טיימרים מושהים ברקע).
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (isIdleExpired()) {
        clearSession();
        setUser(null);
      } else {
        touch();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    // בדיקה תקופתית — מנתקת גם טאב שנשאר פתוח אך נטוש.
    const interval = window.setInterval(() => {
      if (isIdleExpired()) {
        clearSession();
        setUser(null);
      }
    }, TOUCH_THROTTLE_MS);

    // סנכרון בין-טאבים: התנתקות בטאב אחר (הסרת הטוקן) משתקפת גם כאן.
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY && !e.newValue) setUser(null);
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("mousedown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("scroll", onActivity);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [user]);

  const persist = (accessToken: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    touchLastActive();
    setUser(u);
  };

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json());
    if (!res.success) throw new Error(res.error ?? "שגיאה בהתחברות");
    persist(res.data.accessToken, res.data.user);
  };

  const register = async (body: {
    fullName: string;
    email: string;
    password: string;
    optInMarketing: boolean;
  }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    if (!res.success) throw new Error(res.error ?? "שגיאה בהרשמה");
    persist(res.data.accessToken, res.data.user);
  };

  const registerEmployer = async (body: {
    companyName: string;
    contactName: string;
    contactPhone: string;
    email: string;
    password: string;
    optInMarketing: boolean;
  }) => {
    const res = await fetch("/api/auth/employer-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    if (!res.success) throw new Error(res.error ?? "שגיאה בהרשמה");
    persist(res.data.accessToken, res.data.user);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  /** עדכון העדפת דיוור (opt-in/opt-out) דרך proxy. */
  const updateMarketing = async (optInMarketing: boolean) => {
    const t = token();
    if (!t) throw new Error("לא מחובר");
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify({ optInMarketing }),
    }).then((r) => (r.ok ? r.json() : null));
    if (!res?.success) throw new Error(res?.error ?? "שגיאה בשמירת ההעדפה");
    setUser((u) => (u ? { ...u, optInMarketing: res.data.optInMarketing } : u));
  };

  /**
   * עדכון פרטי הפרופיל לדיוור מותאם — שולח רק את השדות שניתנו (PATCH חלקי),
   * וממזג את התשובה ל-state כדי שהטופס יציג מיד את הערכים השמורים.
   */
  const updateProfile = async (fields: ProfileFields) => {
    const t = token();
    if (!t) throw new Error("לא מחובר");
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify(fields),
    }).then((r) => (r.ok ? r.json() : null));
    if (!res?.success) throw new Error(res?.error ?? "שגיאה בשמירת הפרטים");
    setUser((u) =>
      u
        ? {
            ...u,
            phone: res.data.phone ?? null,
            city: res.data.city ?? null,
            preferredField: res.data.preferredField ?? null,
            yearsExperience: res.data.yearsExperience ?? null,
          }
        : u,
    );
  };

  /** מסמן שתזכורת ה-opt-in הוצגה — מעדכן גם את ה-state כדי שלא תוצג שוב כעת. */
  const markOptInPrompted = async () => {
    const t = token();
    if (!t) return;
    await fetch("/api/auth/optin-prompted", {
      method: "POST",
      headers: { Authorization: `Bearer ${t}` },
    }).catch(() => undefined);
    setUser((u) =>
      u ? { ...u, optInPromptedAt: new Date().toISOString() } : u,
    );
  };

  /** שינוי סיסמה — מאמת את הסיסמה הנוכחית בצד שרת. */
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    const t = token();
    if (!t) throw new Error("לא מחובר");
    const res = await fetch("/api/auth/password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    }).then((r) => r.json().catch(() => null));
    if (!res?.success) throw new Error(res?.error ?? "שגיאה בעדכון הסיסמה");
  };

  return {
    user,
    loading,
    login,
    register,
    registerEmployer,
    logout,
    updateMarketing,
    updateProfile,
    markOptInPrompted,
    changePassword,
    getToken: token,
  };
}

/** עוטף את האפליקציה ומחזיק את מצב ההתחברות היחיד והמשותף. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** ניהול התחברות בצד הלקוח — token ב-localStorage, state משותף דרך Context. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth חייב לרוץ בתוך <AuthProvider>");
  return ctx;
}
