/**
 * בדיקת שליחת מייל אמיתית — מאמת חיבור ל-SMTP ושולח מייל בדיקה אחד.
 *
 * הרצה (מתוך תיקיית backend/):
 *   npm run mail:test -- you@example.com
 *   או:  npx ts-node scripts/test-email.ts you@example.com
 *
 * אם לא מועברת כתובת — נשלח אל TEAM_EMAIL מתוך .env.
 *
 * הסקריפט קורא את אותם משתני סביבה שה-EmailService קורא (backend/.env),
 * כך שאם הבדיקה עוברת — גם השליחה האמיתית באפליקציה תעבוד.
 *
 * הערה: בשבת/חג ה-EmailService חוסם שליחה. הסקריפט הזה עוקף את חסימת השבת
 * בכוונה — הוא נועד לבדיקת התשתית בלבד, לא לזרימת המוצר.
 */
import * as dotenv from "dotenv";
import * as nodemailer from "nodemailer";

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`❌ חסר משתנה סביבה: ${name} (בדוק את backend/.env)`);
    process.exit(1);
  }
  return v;
}

async function main(): Promise<void> {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = required("SMTP_USER");
  const pass = required("SMTP_PASS");
  const fromAddress = process.env.MAIL_FROM ?? user;
  const fromName = process.env.MAIL_FROM_NAME ?? "";
  const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;
  const to = process.argv[2] ?? process.env.TEAM_EMAIL ?? fromAddress;

  console.log("— בדיקת שליחת מייל —");
  console.log(`  שרת:   ${host}:${port} (secure=${port === 465})`);
  console.log(`  משתמש: ${user}`);
  console.log(`  שולח:  ${from}`);
  console.log(`  נמען:  ${to}`);
  console.log("");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  process.stdout.write("בודק חיבור ואימות (verify)... ");
  await transporter.verify();
  console.log("✅ החיבור תקין");

  process.stdout.write("שולח מייל בדיקה... ");
  const info = await transporter.sendMail({
    from,
    to,
    subject: "בדיקת מייל — דער שטעלע",
    html: `<div dir="rtl" style="font-family:Arial,sans-serif">
      <p>שלום,</p>
      <p>זהו מייל בדיקה מהמערכת של דער שטעלע. אם קיבלת אותו — שליחת המיילים עובדת. ✅</p>
      <p>בברכה,<br/>צוות דער שטעלע</p>
    </div>`,
  });
  console.log("✅ נשלח");
  console.log(`  messageId: ${info.messageId}`);
  if (info.accepted?.length)
    console.log(`  התקבל ל: ${info.accepted.join(", ")}`);
  if (info.rejected?.length)
    console.log(`  ⚠️ נדחה: ${info.rejected.join(", ")}`);
}

main().catch((err) => {
  console.error("\n❌ הבדיקה נכשלה:");
  console.error(`  ${err?.message ?? err}`);
  console.error(
    "\nבדיקות נפוצות: SMTP_PASS נכון? בבדיקת Resend — MAIL_FROM=onboarding@resend.dev " +
      "והנמען הוא הכתובת שאיתה נרשמת ל-Resend? SMTP_USER=resend?",
  );
  process.exit(1);
});
