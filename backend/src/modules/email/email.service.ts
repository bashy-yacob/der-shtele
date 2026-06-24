import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CandidateStatus } from "@prisma/client";
import * as nodemailer from "nodemailer";
import { ShabbatService } from "../../common/shabbat/shabbat.service";
import { escapeHtml } from "../../common/util/escape-html";

/** עוטף גוף מייל בתבנית RTL אחידה. הטקסט כבר חייב להיות escaped. */
function rtlEmail(bodyHtml: string): string {
  return `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
    ${bodyHtml}
    <p style="margin-top:24px">בברכה,<br/>צוות דער שטעלע</p>
  </div>`;
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

  /** התראה לצוות על פנייה/מועמד חדש. */
  async notifyTeam(subject: string, html: string): Promise<void> {
    await this.send({
      to: this.teamEmail,
      subject: `[דער שטעלע] ${subject}`,
      html,
    });
  }

  /** אישור למועמד שפנייתו התקבלה. */
  async sendCandidateConfirmation(to: string, fullName: string): Promise<void> {
    await this.send({
      to,
      subject: "קיבלנו את פנייתך — דער שטעלע",
      html: rtlEmail(
        `<p>שלום ${escapeHtml(fullName)},</p>
         <p>תודה שפנית אלינו. קיבלנו את פרטיך והצוות שלנו יחזור אליך בהקדם.</p>`,
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
      html: rtlEmail(
        `<p>שלום ${escapeHtml(fullName)},</p><p>${escapeHtml(msg.body)}</p>`,
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
      html: rtlEmail(
        `<p>שלום ${escapeHtml(fullName)},</p>
         <p>תודה שנרשמת לדער שטעלע. כדי לאמת את כתובת המייל, יש ללחוץ על הקישור:</p>
         <p style="margin:16px 0">
           <a href="${link}" style="color:#1d4ed8;font-weight:bold">אימות כתובת המייל ←</a>
         </p>
         <p style="font-size:12px;color:#888">אם לא נרשמת לדער שטעלע, ניתן להתעלם מהודעה זו.</p>`,
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
      html: rtlEmail(
        `<p>שלום ${escapeHtml(fullName)},</p>
         <p>שמחים לבשר שהתקבלת למשרת <b>${escapeHtml(jobTitle)}</b>. מאחלים לך הצלחה רבה בתפקיד החדש!</p>`,
      ),
    });
  }
}
