"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

// מטמון משותף ברמת המודול: כל כפתורי הלב בעמוד מסתנכרנים דרך אותו Set,
// והרשימה נטענת מהשרת פעם אחת בלבד (ולא בקשה לכל כרטיס).
let cache: Set<string> | null = null;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

async function loadOnce(token: string) {
  if (cache || inFlight) return inFlight ?? undefined;
  inFlight = fetch("/api/saved-jobs/ids", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((res) => {
      cache = new Set(Array.isArray(res?.data) ? res.data : []);
    })
    .catch(() => {
      cache = new Set();
    })
    .finally(() => {
      inFlight = null;
      notify();
    });
  return inFlight;
}

/** ניהול מצב המשרות השמורות (משותף בכל העמוד). */
export function useSavedJobs() {
  const { user, getToken } = useAuth();
  const [, forceRender] = useState(0);

  // נרשם לעדכוני המטמון המשותף
  useEffect(() => {
    const l = () => forceRender((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  // טוען את רשימת המזהים פעם אחת כשהמשתמש מחובר
  useEffect(() => {
    const t = getToken();
    if (user && t) void loadOnce(t);
  }, [user, getToken]);

  const isSaved = useCallback((jobId: string) => cache?.has(jobId) ?? false, []);

  const toggle = useCallback(
    async (jobId: string) => {
      const t = getToken();
      if (!t) return;
      if (!cache) cache = new Set();

      const currentlySaved = cache.has(jobId);
      // עדכון אופטימי + סנכרון מיידי של כל הכפתורים
      if (currentlySaved) cache.delete(jobId);
      else cache.add(jobId);
      notify();

      try {
        if (currentlySaved) {
          await fetch(`/api/saved-jobs/${jobId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${t}` },
          });
        } else {
          await fetch("/api/saved-jobs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${t}`,
            },
            body: JSON.stringify({ jobId }),
          });
        }
      } catch {
        // החזרה למצב הקודם אם נכשל
        if (currentlySaved) cache.add(jobId);
        else cache.delete(jobId);
        notify();
      }
    },
    [getToken],
  );

  /** הסרה מפורשת (לא תלוי במצב המטמון) — לשימוש ברשימת השמורות. */
  const unsave = useCallback(
    async (jobId: string) => {
      const t = getToken();
      if (!t) return;
      cache?.delete(jobId);
      notify();
      try {
        await fetch(`/api/saved-jobs/${jobId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${t}` },
        });
      } catch {
        // נכשל — נטען מחדש בפעם הבאה; לא מחזירים למצב שמור כדי לא להטעות
      }
    },
    [getToken],
  );

  return { isAuthed: !!user, isSaved, toggle, unsave };
}
