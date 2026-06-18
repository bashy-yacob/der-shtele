import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  isShabbatOrHoliday,
  nextAllowedSendTime,
} from '../../common/shabbat/shabbat';

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

  constructor(private readonly config: ConfigService) {
    // שם המשתמש להתחברות ל-SMTP. ב-Gmail זו כתובת המייל; ב-Resend זה המחרוזת
    // הקבועה 'resend' (וה-API key נכנס כסיסמה).
    const user = this.config.get<string>('SMTP_USER', 'no-reply@dershtele.co.il');

    // כתובת השולח (From) נפרדת משם המשתמש: ב-Resend ה-From חייב להיות כתובת
    // מאומתת (onboarding@resend.dev בבדיקה, או noreply@dershtele.co.il אחרי
    // אימות דומיין) — שונה משם המשתמש 'resend'. ברירת מחדל: ליפול חזרה ל-SMTP_USER
    // כך שהגדרת Gmail (user == from) ממשיכה לעבוד בלי MAIL_FROM.
    const fromAddress = this.config.get<string>('MAIL_FROM', user);
    const fromName = this.config.get<string>('MAIL_FROM_NAME', '');
    this.from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;
    this.teamEmail = this.config.get<string>('TEAM_EMAIL', fromAddress);

    const pass = this.config.get<string>('SMTP_PASS', '');
    // SMTP נחשב "מוגדר" רק כשיש סיסמה. בלי זה לא מנסים להתחבר כלל — אחרת כל
    // שליחה נתקעת בהמתנה ל-timeout מול השרת. fail-soft, כמו שהאיפיון מבטיח.
    this.enabled = Boolean(pass);

    const port = this.config.get<number>('SMTP_PORT', 587);
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
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
    if (isShabbatOrHoliday()) {
      const when = nextAllowedSendTime();
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
    await this.send({ to: this.teamEmail, subject: `[דער שטעלע] ${subject}`, html });
  }

  /** אישור למועמד שפנייתו התקבלה. */
  async sendCandidateConfirmation(to: string, fullName: string): Promise<void> {
    await this.send({
      to,
      subject: 'קיבלנו את פנייתך — דער שטעלע',
      html: `<div dir="rtl" style="font-family:Arial,sans-serif">
        <p>שלום ${fullName},</p>
        <p>תודה שפנית אלינו. קיבלנו את פרטיך והצוות שלנו יחזור אליך בהקדם.</p>
        <p>בברכה,<br/>צוות דער שטעלע</p>
      </div>`,
    });
  }
}
