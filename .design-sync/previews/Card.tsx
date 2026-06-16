import { Button, Card } from '@der-shtele/frontend';

// Basic card — heading and body copy.
export const Default = () => (
  <Card className="max-w-md">
    <h3>ברוכים הבאים לדער שטעלע</h3>
    <p className="mt-2 text-neutral-700">
      סוכנות השמה דיגיטלית לציבור החרדי. כל קשר בין מועמד למעסיק עובר דרך הצוות.
    </p>
  </Card>
);

// Job summary card — the primary composition pattern in the app
// (role, type, location, description, actions). Company details stay hidden.
export const JobSummary = () => (
  <Card className="max-w-md">
    <h3>מנהל/ת חשבונות</h3>
    <p className="mt-1 text-sm text-neutral-700">משרה מלאה · בני ברק</p>
    <p className="mt-3 text-neutral-700">
      דרוש/ה מנהל/ת חשבונות מנוסה לתפקיד מגוון בסביבה נעימה ומכבדת.
    </p>
    <div className="mt-4 flex flex-wrap gap-2">
      <Button>שליחת מועמדות</Button>
      <Button variant="outline">שמירת משרה</Button>
    </div>
  </Card>
);

// Informational notice card — text only.
export const Notice = () => (
  <Card className="max-w-md">
    <h3>שימו לב</h3>
    <p className="mt-2 text-neutral-700">
      פרטי החברה נמסרים רק לאחר סינון ואישור הצוות. גולש שאינו רשום יכול לצפות
      במשרות בלבד; שליחת קורות חיים מחייבת הרשמה.
    </p>
  </Card>
);
