import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CandidateStatus } from "@prisma/client";
import * as nodemailer from "nodemailer";
import { ShabbatService } from "../../common/shabbat/shabbat.service";
import { escapeHtml } from "../../common/util/escape-html";

/**
 * צבעי המותג — תואמים ל-`frontend/tailwind.config.js` (navy / olive / sand / ink).
 * "חם אך מקצועי": navy ראשי, olive אקסנט, sand נייטרלים חמים, ink לטקסט.
 */
const BRAND = {
  navy: "#1F3A5F", // ראשי — header, כותרות, כפתור primary
  navyDark: "#122238", // footer
  olive: "#74803F", // אקסנט — נקודת ה-wordmark, כפתור CTA, קישורים
  oliveLight: "#ADB67F",
  sandBg: "#F7F2E7", // רקע הדף
  sandBorder: "#EFE7D5", // גבולות
  sandSoft: "#C9B894", // טקסט על רקע כהה
  inkHeading: "#211E18", // כותרות
  inkBody: "#4A4439", // גוף
  inkMuted: "#8C8475", // משני
  white: "#FFFFFF",
} as const;

interface EmailLayoutOptions {
  /** כותרת H1 בראש הכרטיס (navy, סריף). */
  heading?: string;
  /** טקסט preheader נסתר — התצוגה המקדימה בתיבת הדואר. */
  preheader?: string;
  /** שורת ה-footer מתחת לשורת המותג; ברירת מחדל = פרטי קשר. `null` מסתיר. */
  footerNote?: string | null;
  /** משפט סיום; ברירת מחדל "בברכה, צוות דער שטעלע". `null` למיילים פנימיים. */
  closing?: string | null;
}

/**
 * כפתור CTA "חסין" (table-based) בצבעי המותג. `accent`=olive, `primary`=navy.
 * ה-href וה-label אינם עוברים escape כאן — באחריות הקורא להעביר ערכים בטוחים.
 */
function emailButton(
  href: string,
  label: string,
  variant: "primary" | "accent" = "accent",
): string {
  const bg = variant === "primary" ? BRAND.navy : BRAND.olive;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0">
    <tr><td align="center" bgcolor="${bg}" style="border-radius:10px">
      <a href="${href}" style="display:inline-block;padding:13px 30px;font-family:Arial,Heebo,sans-serif;font-size:15px;font-weight:bold;color:${BRAND.white};text-decoration:none;border-radius:10px">${label}</a>
    </td></tr>
  </table>`;
}

/**
 * עוטף גוף מייל (כבר escaped) בתבנית ממותגת: RTL מלא, header עם ה-wordmark
 * וצבעי המותג, כרטיס תוכן לבן, ו-footer. table-based לתאימות לקוחות מייל.
 */
function brandedEmail(bodyHtml: string, opts: EmailLayoutOptions = {}): string {
  const {
    heading,
    preheader = "",
    footerNote = `מייל: dershtele@gmail.com · אין מענה בשבת ויום טוב`,
    closing = "בברכה,<br/>צוות דער שטעלע",
  } = opts;
  const year = new Date().getFullYear();

  const headingHtml = heading
    ? `<h1 style="margin:0 0 16px;font-family:Georgia,'Frank Ruhl Libre',serif;font-size:21px;font-weight:bold;color:${BRAND.navy};text-align:right">${heading}</h1>`
    : "";
  const closingHtml = closing
    ? `<p style="margin:28px 0 0;color:${BRAND.inkHeading}">${closing}</p>`
    : "";
  const footerNoteHtml = footerNote
    ? `<div style="margin-top:6px">${footerNote}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="he" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <title>דער שטעלע</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.sandBg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.sandBg}">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${BRAND.white};border:1px solid ${BRAND.sandBorder};border-radius:16px;overflow:hidden">
        <!-- header — wordmark מותגי -->
        <tr><td dir="rtl" align="right" style="background:${BRAND.navy};padding:22px 28px">
          <span style="font-family:Georgia,'Frank Ruhl Libre',serif;font-size:24px;font-weight:bold;color:${BRAND.white};letter-spacing:-0.5px">דער שטעלע</span><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${BRAND.olive};margin-right:5px;vertical-align:middle"></span>
          <div style="font-family:Arial,Heebo,sans-serif;font-size:12px;color:${BRAND.sandSoft};margin-top:5px">מוצאים לך את המשרה הנכונה</div>
        </td></tr>
        <!-- content -->
        <tr><td dir="rtl" align="right" style="padding:30px 28px;font-family:Arial,Heebo,sans-serif;font-size:15px;line-height:1.7;color:${BRAND.inkBody};text-align:right">
          ${headingHtml}
          ${bodyHtml}
          ${closingHtml}
        </td></tr>
        <!-- footer -->
        <tr><td dir="rtl" align="right" style="background:${BRAND.navyDark};padding:20px 28px">
          <div style="font-family:Arial,Heebo,sans-serif;font-size:12px;color:${BRAND.sandSoft};line-height:1.7">
            <div>סוכנות השמה מקצועית לציבור החרדי בישראל · כל קשר עובר דרך הצוות</div>
            ${footerNoteHtml}
          </div>
          <div style="font-family:Arial,Heebo,sans-serif;font-size:11px;color:${BRAND.inkMuted};margin-top:10px">© ${year} דער שטעלע · כל הזכויות שמורות</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

/**
 * EmailService — שליחת מיילים דרך SMTP (Nodemailer).
 * כלל קריטי: אין לשלוח בשבת/חג. מייל שנוצר בשבת נדחה לזמן המותר הבא.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly teamEmail: string;
  private readonly enabled: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly shabbat: ShabbatService,
  ) {
    // שם המשתמש להתחברות ל-SMTP. ב-Gmail זו כתובת המייל; ב-Resend זה המחרוזת
    // הקבועה 'resend' (וה-API key נכנס כסיסמה).
    const user = this.config.get<string>(
      "SMTP_USER",
      "no-reply@dershtele.co.il",
    );

    // כתובת השולח (From) נפרדת משם המשתמש: ב-Resend ה-From חייב להיות כתובת
    // מאומתת (onboarding@resend.dev בבדיקה, או noreply@dershtele.co.il אחרי
    // אימות דומיין) — שונה משם המשתמש 'resend'. ברירת מחדל: ליפול חזרה ל-SMTP_USER
    // כך שהגדרת Gmail (user == from) ממשיכה לעבוד בלי MAIL_FROM.
    const fromAddress = this.config.get<string>("MAIL_FROM", user);
    const fromName = this.config.get<string>("MAIL_FROM_NAME", "");
    this.from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;
    this.teamEmail = this.config.get<string>("TEAM_EMAIL", fromAddress);

    const pass = this.config.get<string>("SMTP_PASS", "");
    // SMTP נחשב "מוגדר" רק כשיש סיסמה. בלי זה לא מנסים להתחבר כלל — אחרת כל
    // שליחה נתקעת בהמתנה ל-timeout מול השרת. fail-soft, כמו שהאיפיון מבטיח.
    this.enabled = Boolean(pass);

    const port = this.config.get<number>("SMTP_PORT", 587);
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>("SMTP_HOST", "smtp.gmail.com"),
      port,
      // 465 = SMTPS (TLS מיידי); 587/2587 = STARTTLS. גם Gmail וגם Resend
      // תומכים ב-587, אז ברירת המחדל לא מוצפנת-מיידית אלא משדרגת ל-TLS.
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      // רשת ביטחון: גם אם מוגדר אך השרת לא מגיב — להיכשל מהר ולא לתקוע את הבקשה.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }

  /** שולח מייל — או דוחה לזמן מותר אם כעת שבת/חג. */
  async send(msg: MailMessage): Promise<void> {
    if (await this.shabbat.isForbidden()) {
      const when = await this.shabbat.nextAllowedSendTime();
      this.logger.warn(
        `שבת/חג — המייל אל ${msg.to} נדחה ל-${when.toISOString()} (TODO: תור תזמון)`,
      );
      // TODO שלב ב: לשמור בתור (DB/Bull) ולשלוח ב-when. כרגע מדלגים בבטחה.
      return;
    }

    if (!this.enabled) {
      this.logger.warn(
        `SMTP לא מוגדר — מדלג על שליחת מייל אל ${msg.to} (רק log)`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
      });
    } catch (err) {
      // לא מפילים את הבקשה בגלל מייל — רק לוג
      this.logger.error(`כשל בשליחת מייל אל ${msg.to}`, err as Error);
    }
  }

  /**
   * עוטף גוף מייל (פרגמנט HTML שכבר עבר escape) בתבנית הממותגת של דער שטעלע.
   * חשוף לשירותים אחרים (mailing וכו') כדי לשמור מראה אחיד בכל המיילים.
   */
  wrap(bodyHtml: string, opts?: EmailLayoutOptions): string {
    return brandedEmail(bodyHtml, opts);
  }

  /** כפתור CTA ממותג (table-based, חסין-לקוחות-מייל). */
  button(
    href: string,
    label: string,
    variant: "primary" | "accent" = "accent",
  ): string {
    return emailButton(href, label, variant);
  }

  /** התראה לצוות על פנייה/מועמד חדש — ממותגת, ללא משפט סיום ללקוח. */
  async notifyTeam(subject: string, html: string): Promise<void> {
    await this.send({
      to: this.teamEmail,
      subject: `[דער שטעלע] ${subject}`,
      html: brandedEmail(html, {
        heading: subject,
        preheader: "התראת צוות — דער שטעלע",
        closing: null,
        footerNote: "התראה פנימית · דשבורד הניהול",
      }),
    });
  }

  /** אישור למועמד שפנייתו התקבלה. */
  async sendCandidateConfirmation(to: string, fullName: string): Promise<void> {
    await this.send({
      to,
      subject: "קיבלנו את פנייתך — דער שטעלע",
      html: brandedEmail(
        `<p style="margin:0 0 14px">שלום ${escapeHtml(fullName)},</p>
         <p style="margin:0">תודה שפנית אלינו. קיבלנו את פרטיך והצוות שלנו יחזור אליך בהקדם.</p>`,
        {
          heading: "קיבלנו את פנייתך",
          preheader: "קיבלנו את פרטיך — הצוות יחזור אליך בהקדם.",
        },
      ),
    });
  }

  /**
   * עדכון סטטוס למועמד (סעיף 8.2) — הודעת שירות ידידותית לפי הסטטוס החדש.
   * הודעת שירות על מועמדות המשתמש עצמו (לא דבר פרסומת) — נשלחת תמיד.
   */
  async sendStatusUpdate(
    to: string,
    fullName: string,
    status: CandidateStatus,
  ): Promise<void> {
    const copy: Partial<
      Record<CandidateStatus, { subject: string; body: string }>
    > = {
      in_progress: {
        subject: "פנייתך בטיפול — דער שטעלע",
        body: "פנייתך אצלנו בטיפול. הצוות בוחן את הפרטים ויחזור אליך בהקדם.",
      },
      presented: {
        subject: "עדכון בתהליך — דער שטעלע",
        body: "יש לנו עדכון מעודד: הצגנו את מועמדותך למעסיק. נמשיך ללוות אותך ונעדכן בכל התקדמות.",
      },
      not_suitable: {
        subject: "עדכון לגבי מועמדותך — דער שטעלע",
        body: "לאחר בחינה, כרגע לא נמצאה התאמה למשרה זו. אנחנו ממשיכים לחפש עבורך הזדמנויות מתאימות ונהיה בקשר.",
      },
    };
    const msg = copy[status];
    if (!msg) return; // new/hired — לא נשלח מכאן
    await this.send({
      to,
      subject: msg.subject,
      html: brandedEmail(
        `<p style="margin:0 0 14px">שלום ${escapeHtml(fullName)},</p>
         <p style="margin:0">${escapeHtml(msg.body)}</p>`,
        { heading: "עדכון לגבי מועמדותך", preheader: msg.body },
      ),
    });
  }

  /** מייל אימות כתובת (סעיף 3.1 + 8.2) — קישור חד-פעמי. */
  async sendVerificationEmail(
    to: string,
    fullName: string,
    token: string,
  ): Promise<void> {
    const appUrl = this.config.get<string>(
      "APP_URL",
      "https://der-shtele.vercel.app",
    );
    const link = `${appUrl}/auth/verify?token=${token}`;
    await this.send({
      to,
      subject: "אימות כתובת המייל — דער שטעלע",
      html: brandedEmail(
        `<p style="margin:0 0 14px">שלום ${escapeHtml(fullName)},</p>
         <p style="margin:0">תודה שנרשמת לדער שטעלע. כדי לאמת את כתובת המייל, יש ללחוץ על הכפתור:</p>
         ${emailButton(link, "אימות כתובת המייל ←", "primary")}
         <p style="margin:0;font-size:12px;color:${BRAND.inkMuted}">אם לא נרשמת לדער שטעלע, ניתן להתעלם מהודעה זו.</p>`,
        {
          heading: "אימות כתובת המייל",
          preheader: "צעד אחרון — אימות כתובת המייל שלך בדער שטעלע.",
        },
      ),
    });
  }

  /** ברכה על גיוס מוצלח — נשלח מ-markHired. */
  async sendHiredCongrats(
    to: string,
    fullName: string,
    jobTitle: string,
  ): Promise<void> {
    await this.send({
      to,
      subject: "מזל טוב! התקבלת למשרה — דער שטעלע",
      html: brandedEmail(
        `<p style="margin:0 0 14px">שלום ${escapeHtml(fullName)},</p>
         <p style="margin:0">שמחים לבשר שהתקבלת למשרת <b style="color:${BRAND.navy}">${escapeHtml(jobTitle)}</b>. מאחלים לך הצלחה רבה בתפקיד החדש!</p>`,
        {
          heading: "מזל טוב — התקבלת למשרה!",
          preheader: `התקבלת למשרת ${jobTitle}. בהצלחה!`,
        },
      ),
    });
  }

  /** התראה פנימית לצוות על בקשת גישה חדשה ממעסיק (הרשמה עצמית, סעיף 6). */
  async notifyEmployerSignup(
    company: string,
    contact: string,
    phone: string,
    email: string,
  ): Promise<void> {
    await this.notifyTeam(
      `בקשת גישה חדשה ממעסיק — ${company}`,
      `<div dir="rtl">
         <p>מעסיק נרשם עצמאית וממתין לאישור הצוות:</p>
         <ul>
           <li>חברה: ${escapeHtml(company)}</li>
           <li>איש קשר: ${escapeHtml(contact)}</li>
           <li>טלפון: ${escapeHtml(phone)}</li>
           <li>מייל: ${escapeHtml(email)}</li>
         </ul>
         <p>לאימות ואישור/דחייה: דשבורד ← ניהול מעסיקים.</p>
       </div>`,
    );
  }

  /** אישור למעסיק שבקשת ההצטרפות התקבלה (לפני אישור הצוות). */
  async sendEmployerSignupConfirmation(
    to: string,
    contactName: string,
  ): Promise<void> {
    await this.send({
      to,
      subject: "קיבלנו את בקשת ההצטרפות — דער שטעלע",
      html: brandedEmail(
        `<p style="margin:0 0 14px">שלום ${escapeHtml(contactName)},</p>
         <p style="margin:0">קיבלנו את בקשת ההצטרפות שלך לפורטל המעסיקים. הצוות יאמת את הפרטים
         ויאשר את החשבון בהקדם, ונעדכן אותך ברגע שהחשבון יאושר.</p>`,
        {
          heading: "קיבלנו את בקשת ההצטרפות",
          preheader: "הבקשה התקבלה — נעדכן אותך עם אישור החשבון.",
        },
      ),
    });
  }

  /** עדכון למעסיק שהחשבון אושר — אפשר להתחבר ולפרסם משרות. */
  async sendEmployerApproved(to: string, contactName: string): Promise<void> {
    const appUrl = this.config.get<string>(
      "APP_URL",
      "https://der-shtele.vercel.app",
    );
    await this.send({
      to,
      subject: "החשבון אושר — אפשר לפרסם משרות — דער שטעלע",
      html: brandedEmail(
        `<p style="margin:0 0 14px">שלום ${escapeHtml(contactName)},</p>
         <p style="margin:0">שמחים לעדכן שחשבון המעסיק שלך אושר. אפשר להתחבר לפורטל ולפרסם משרות:</p>
         ${emailButton(`${appUrl}/portal/login`, "כניסה לפורטל המעסיקים ←", "primary")}
         <p style="margin:0">כל משרה שתפרסם תעבור לבדיקה ואישור הצוות לפני שתעלה לאתר.</p>`,
        {
          heading: "החשבון אושר ✓",
          preheader: "אפשר להתחבר לפורטל ולפרסם משרות.",
        },
      ),
    });
  }

  /** עדכון למעסיק שבקשת ההצטרפות לא אושרה — עם סיבה אופציונלית. */
  async sendEmployerRejected(
    to: string,
    contactName: string,
    reason?: string,
  ): Promise<void> {
    await this.send({
      to,
      subject: "עדכון לגבי בקשת ההצטרפות — דער שטעלע",
      html: brandedEmail(
        `<p style="margin:0 0 14px">שלום ${escapeHtml(contactName)},</p>
         <p style="margin:0 0 14px">לאחר בחינה, לא נוכל לאשר כעת את החשבון.${
           reason ? ` ${escapeHtml(reason)}` : ""
         }</p>
         <p style="margin:0">לפרטים נוספים ניתן לפנות לצוות.</p>`,
        {
          heading: "עדכון לגבי בקשת ההצטרפות",
          preheader: "עדכון לגבי בקשת ההצטרפות שלך לפורטל המעסיקים.",
        },
      ),
    });
  }
}
