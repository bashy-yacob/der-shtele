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
            phone: res.data.phone ?? null,
            city: res.data.city ?? null,
            preferredField: res.data.preferredField ?? null,
            yearsExperience: res.data.yearsExperience ?? null,
            optInPromptedAt: res.data.optInPromptedAt ?? null,
            authProvider: res.data.authProvider,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [token]);

  const persist = (accessToken: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
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

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
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
