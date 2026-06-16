import { Button } from '@der-shtele/frontend';

// Primary action — the default variant, used for the main call-to-action.
export const Primary = () => <Button>שליחת מועמדות</Button>;

// Secondary action — the outline variant for lower-emphasis actions.
export const Outline = () => <Button variant="outline">שמירת משרה</Button>;

// Both variants side by side (the variant axis).
export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>שליחת מועמדות</Button>
    <Button variant="outline">שמירת משרה</Button>
  </div>
);

// Disabled state for both variants (e.g. while a form is submitting).
export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button disabled>שולח…</Button>
    <Button variant="outline" disabled>
      שמירת משרה
    </Button>
  </div>
);

// Full-width submit button via the className pass-through — the form layout.
export const FullWidth = () => (
  <div className="max-w-sm">
    <Button type="submit" className="w-full">
      הרשמה
    </Button>
  </div>
);
