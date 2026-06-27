/**
 * שולח מייל בודד אמיתי דרך EmailService האמיתי של המערכת — בדיוק כפי שהאפליקציה
 * שולחת בפרודקשן, כולל התבנית הממותגת (לוגו/צבעים) וכלל השבת.
 *
 * הרצה (מתוך תיקיית backend/):
 *   npm run mail:preview -- you@example.com verify
 *   או:  npx ts-node scripts/send-branded-email.ts you@example.com verify
 *
 * ארגומנט 1 = נמען (ברירת מחדל: TEAM_EMAIL / MAIL_FROM מ-.env).
 * ארגומנט 2 = סוג המייל (ברירת מחדל: verify). אפשרויות:
 *   verify   — אימות כתובת מייל (עם כפתור)
 *   confirm  — אישור קבלת פנייה
 *   status   — עדכון סטטוס (הוצגת למעסיק)
 *   hired    — ברכת גיוס
 *   approved — אישור חשבון מעסיק (עם כפתור)
 *   rejected — דחיית בקשת מעסיק
 *   signup   — אישור קבלת בקשת הצטרפות מעסיק
 *
 * מאתחל את EmailService + ShabbatService ישירות (בלי DB/Nest מלא), עם אותם
 * משתני סביבה (backend/.env). אם כעת שבת/חג — EmailService לא ישלח (כמתוכנן).
 */
import * as dotenv from "dotenv";
import { ConfigService } from "@nestjs/config";
import { CandidateStatus } from "@prisma/client";
import { ShabbatService } from "../src/common/shabbat/shabbat.service";
import { EmailService } from "../src/modules/email/email.service";

dotenv.config();

async function main(): Promise<void> {
  const to =
    process.argv[2] ??
    process.env.TEAM_EMAIL ??
    process.env.MAIL_FROM ??
    process.env.SMTP_USER;
  const type = (process.argv[3] ?? "verify").toLowerCase();
  const name = "בשי";

  if (!to) {
    console.error("❌ לא צוין נמען ואין TEAM_EMAIL/MAIL_FROM ב-.env");
    process.exit(1);
  }

  const config = new ConfigService();
  const shabbat = new ShabbatService();
  const email = new EmailService(config, shabbat);

  console.log(`— שליחת מייל "${type}" אל ${to} דרך EmailService האמיתי —`);
  if (await shabbat.isForbidden()) {
    console.warn(
      "⚠️ כעת שבת/חג — EmailService חוסם שליחה. נסי שוב לאחר צאת השבת/החג.",
    );
  }

  switch (type) {
    case "verify":
      await email.sendVerificationEmail(to, name, "sample-token-123");
      break;
    case "confirm":
      await email.sendCandidateConfirmation(to, name);
      break;
    case "status":
      await email.sendStatusUpdate(to, name, CandidateStatus.presented);
      break;
    case "hired":
      await email.sendHiredCongrats(to, name, "מנהל/ת חשבונות");
      break;
    case "approved":
      await email.sendEmployerApproved(to, name);
      break;
    case "rejected":
      await email.sendEmployerRejected(to, name, "");
      break;
    case "signup":
      await email.sendEmployerSignupConfirmation(to, name);
      break;
    default:
      console.error(
        `❌ סוג לא מוכר: "${type}". אפשרויות: verify | confirm | status | hired | approved | rejected | signup`,
      );
      process.exit(1);
  }

  console.log(
    "✅ הפעולה הסתיימה. אם SMTP מוגדר ולא שבת — המייל יצא. בדקי גם ספאם/קידומי מכירות.",
  );
}

main().catch((err) => {
  console.error("❌ שגיאה:", err?.message ?? err);
  process.exit(1);
});
