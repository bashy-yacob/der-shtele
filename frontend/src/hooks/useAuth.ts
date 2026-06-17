"use client";

import { useCallback, useEffect, useState } from "react";

// קוראים דרך proxy routes יחסיים (same-origin) ולא ישירות לבק — כך ההתחברות
// לא נחסמת ע"י NetFree אצל משתמשים חרדים.
const TOKEN_KEY = "ds_token";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  optInMarketing?: boolean;
}

/** ניהול התחברות בצד הלקוח — token ב-localStorage. */
export function useAuth() {
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
    changePassword,
    getToken: token,
  };
}
