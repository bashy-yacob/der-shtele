import { Input } from '@der-shtele/frontend';

// Default field — label above, placeholder inside.
export const Default = () => (
  <div className="max-w-sm">
    <Input label="שם מלא" id="name" placeholder="ישראל ישראלי" />
  </div>
);

// Error state — message below the field plus error styling.
export const WithError = () => (
  <div className="max-w-sm">
    <Input
      label="דוא״ל"
      id="email"
      defaultValue="israel.example"
      error="כתובת דוא״ל אינה תקינה"
    />
  </div>
);

// No label — e.g. a standalone search field.
export const WithoutLabel = () => (
  <div className="max-w-sm">
    <Input id="search" placeholder="חיפוש משרות…" />
  </div>
);

// Disabled field.
export const Disabled = () => (
  <div className="max-w-sm">
    <Input label="תעודת זהות" id="idnum" defaultValue="——" disabled />
  </div>
);

// A realistic stacked form — the registration / application pattern.
export const FormFields = () => (
  <div className="flex max-w-sm flex-col gap-4">
    <Input label="שם מלא" id="f-name" placeholder="ישראל ישראלי" />
    <Input label="דוא״ל" id="f-email" placeholder="name@example.com" type="email" />
    <Input label="טלפון" id="f-phone" placeholder="050-0000000" />
  </div>
);
