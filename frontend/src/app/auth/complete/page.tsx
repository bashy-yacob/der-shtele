"use client";

// עמוד handoff לזרימת Google: ה-callback (server) מפנה לכאן עם הטוקן ב-URL
// fragment. כאן (client) שומרים אותו ל-localStorage כמו בהתחברות רגילה, מנקים
// את ה-hash מההיסטוריה, ומנווטים לאזור האישי בטעינה מלאה כדי ש-useAuth יטען
// מחדש את פרטי המשתמש מ-/api/auth/me.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEY = "ds_token";

export default function AuthCompletePage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const token = new URLSearchParams(hash).get("token");

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      // ניקוי ה-hash כדי שהטוקן לא יישאר ב-URL / בהיסטוריה.
      window.history.replaceState(null, "", window.location.pathname);
      // טעינה מלאה — מבטיחה ש-AuthProvider ירוץ מחדש ויטען את המשתמש.
      window.location.replace("/account");
    } else {
      router.replace("/login?error=google");
    }
  }, [router]);

  return (
    <main className="py-16 text-center text-ink-500" dir="rtl">
      מתחבר...
    </main>
  );
}
