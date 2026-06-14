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
    this.from = this.config.get<string>('SMTP_USER', 'no-reply@dershtele.co.il');
    this.teamEmail = this.config.get<string>('TEAM_EMAIL', this.from);

    const pass = this.config.get<string>('SMTP_PASS', '');
    // SMTP נחשב "מוגדר" רק כשיש סיסמה. בלי זה לא מנסים להתחבר כלל — אחרת כל
    // שליחה נתקעת בהמתנה ל-timeout מול Gmail. fail-soft, כמו שהאיפיון מבטיח.
    this.enabled = Boolean(pass);

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.from,
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
