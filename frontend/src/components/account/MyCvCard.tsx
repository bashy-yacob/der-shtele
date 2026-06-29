"use client";

// קו"ח בפרופיל (סעיף 3.2 באיפיון) — הצגת הקו"ח הנוכחי + אפשרות החלפה.
// הקו"ח נוצר בהגשת המועמדות הראשונה; כאן ניתן לצפות ולהחליף אותו.
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";

const ALLOWED = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

interface CvState {
  hasCv: boolean;
  cvUploadedAt?: string | null;
  url?: string;
}

export function MyCvCard() {
  const { getToken } = useAuth();
  const [cv, setCv] = useState<CvState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/candidates/me/cv", {
      headers: { Authorization: `Bearer ${getToken() ?? ""}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => setCv(res?.data ?? { hasCv: false }))
      .catch(() => setCv({ hasCv: false }));
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setNote("");
    if (file.size > 5 * 1024 * 1024) {
      setError("קובץ גדול מדי (עד 5MB)");
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      setError("פורמט קובץ לא נתמך (רק PDF או Word)");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const res = await fetch("/api/candidates/me/cv", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
        body: fd,
      }).then((r) => r.json().catch(() => null));
      if (res?.success === false || res?.error) {
        throw new Error(res.error ?? "שגיאה בהחלפת הקובץ");
      }
      setNote("קורות החיים עודכנו בהצלחה.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהחלפת הקובץ");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (!cv) return null;

  return (
    <Card className="space-y-3">
      <h2 className="font-display text-lg text-ink-900">קורות חיים</h2>

      {cv.hasCv ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-ink-700">
            <p className="font-medium">קובץ קיים בפרופיל</p>
            {cv.cvUploadedAt && (
              <p className="text-ink-400 text-xs mt-0.5">
                עודכן: {new Date(cv.cvUploadedAt).toLocaleDateString("he-IL")}
              </p>
            )}
          </div>
          {cv.url && (
            <a
              href={cv.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-navy-600 hover:underline"
            >
              צפייה בקובץ ←
            </a>
          )}
        </div>
      ) : (
        <p className="text-sm text-ink-500 leading-relaxed">
          עדיין לא הועלו קורות חיים. הקובץ יתווסף לפרופיל בהגשת המועמדות
          הראשונה, ולאחר מכן ניתן יהיה להחליפו כאן.
        </p>
      )}

      {cv.hasCv && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={onFile}
            disabled={uploading}
            className="w-full text-sm text-ink-500 file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 cursor-pointer"
          />
          {uploading && <p className="text-xs text-ink-400 mt-1">מעלה...</p>}
        </div>
      )}

      {note && <p className="text-sm text-olive-700">{note}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </Card>
  );
}
