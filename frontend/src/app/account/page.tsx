"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button, Input, CityCombobox, TagMultiSelect } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { FIELD_LABELS, buildCityOptions } from "@/lib/constants";
import { EmailVerificationBanner } from "@/components/account/EmailVerificationBanner";
import { ProfileCompletionBanner } from "@/components/account/ProfileCompletionBanner";
import { MyCvCard } from "@/components/account/MyCvCard";
import type { JobField } from "@/types";

export default function AccountProfilePage() {
  const { user, updateProfile } = useAuth();

  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [preferredFields, setPreferredFields] = useState<string[]>([]);
  const [years, setYears] = useState("");

  const fieldOptions = Object.entries(FIELD_LABELS).map(([value, text]) => ({
    value,
    text,
  }));
  const togglePreferred = (v: string) =>
    setPreferredFields((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );

  const [cityOptions, setCityOptions] = useState<string[]>(buildCityOptions());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  // טוען לתוך הטופס את הערכים השמורים כשהמשתמש נטען/מתעדכן.
  useEffect(() => {
    setPhone(user?.phone ?? "");
    setCity(user?.city ?? "");
    setPreferredFields(user?.preferredFields ?? []);
    setYears(
      typeof user?.yearsExperience === "number"
        ? String(user.yearsExperience)
        : "",
    );
  }, [user?.phone, user?.city, user?.preferredFields, user?.yearsExperience]);

  // רשימת הערים הקיימות (same-origin proxy → לא נחסם ע"י NetFree). נכשל בעדינות.
  useEffect(() => {
    fetch("/api/jobs/regions")
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j?.data)) setCityOptions(buildCityOptions(j.data));
      })
      .catch(() => undefined);
  }, []);

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(false);
    try {
      const parsedYears = years.trim() === "" ? null : Number(years);
      if (
        parsedYears !== null &&
        (Number.isNaN(parsedYears) || parsedYears < 0)
      ) {
        throw new Error("שנות הניסיון חייבות להיות מספר חיובי.");
      }
      await updateProfile({
        phone: phone.trim() || null,
        city: city.trim() || null,
        preferredFields: preferredFields as JobField[],
        yearsExperience: parsedYears,
      });
      setMessage("הפרטים נשמרו בהצלחה.");
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "שגיאה בשמירה.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink-900">הפרופיל שלי</h1>

      <ProfileCompletionBanner />
      <EmailVerificationBanner />

      {/* פרטי חשבון — לקריאה בלבד */}
      <Card className="space-y-3">
        <Field label="דואר אלקטרוני" value={user?.email ?? "—"} />
        <Field
          label="תפקיד"
          value={user?.role === "candidate" ? "מועמד" : (user?.role ?? "—")}
        />
      </Card>

      {/* פרטים אישיים לדיוור מותאם */}
      <Card className="space-y-4">
        <div>
          <h2 className="font-display text-lg text-ink-900">פרטים אישיים</h2>
          <p className="text-sm text-ink-500 mt-1 leading-relaxed">
            הפרטים האלה עוזרים לנו להתאים עבורך את העדכונים — כך שנשלח לך משרות
            רלוונטיות לאזור המגורים ולתחום שמעניין אותך, ולא דיוור כללי. המילוי
            הוא לבחירתך וניתן לעדכן בכל עת.
          </p>
        </div>

        <Input
          id="phone"
          type="tel"
          label="טלפון"
          placeholder="050-0000000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <CityCombobox
          id="city"
          label="עיר / אזור מגורים"
          options={cityOptions}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <TagMultiSelect
          label="תחום תעסוקה מבוקש"
          placeholder="הוסף תחום…"
          options={fieldOptions}
          selected={preferredFields}
          onToggle={togglePreferred}
        />
        <p className="-mt-2 text-xs text-ink-400">ניתן לבחור כמה תחומים</p>

        <Input
          id="years"
          type="number"
          min={0}
          max={80}
          label="שנות ניסיון"
          placeholder="לדוגמה: 3"
          value={years}
          onChange={(e) => setYears(e.target.value)}
        />

        <Button onClick={onSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? "שומר..." : "שמירת פרטים"}
        </Button>
        {message && (
          <p
            className={
              error ? "text-sm text-red-600" : "text-sm text-olive-700"
            }
          >
            {message}
          </p>
        )}
      </Card>

      {/* קורות חיים בפרופיל — הצגה + החלפה */}
      <MyCvCard />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-3 border-b border-sand-200 pb-2 last:border-0">
      <span className="text-ink-500 text-sm shrink-0">{label}</span>
      <span className="font-medium text-ink-900 text-end break-words min-w-0">
        {value}
      </span>
    </div>
  );
}
