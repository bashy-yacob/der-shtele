"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

/** קישור לדשבורד — מוצג רק לחברי צוות (staff/admin). */
export function AdminHeaderLink() {
  const { user } = useAuth();
  if (!user || (user.role !== "staff" && user.role !== "admin")) return null;
  return (
    <Link
      href="/admin"
      className="hidden md:inline text-sm font-bold text-olive-700 hover:text-olive-600 transition-colors py-1.5"
    >
      דשבורד צוות
    </Link>
  );
}
