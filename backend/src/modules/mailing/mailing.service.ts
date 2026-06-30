import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CandidateStatus, JobField, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { ShabbatService } from "../../common/shabbat/shabbat.service";
import { escapeHtml } from "../../common/util/escape-html";
import { SendMailingDto, MailingFilterDto } from "./dto/send-mailing.dto";

export interface Subscriber {
  userId: string;
  email: string;
  fullName: string;
  optInAt: Date | null;
  field: JobField | null;
  region: string | null;
  status: CandidateStatus | null;
}

/**
 * ניהול רשימת התפוצה (סעיף 8.3).
 * רשימת התפוצה = משתמשים עם הסכמת מייל תקפה (optInMarketing).
 * סינון לפי תחום/אזור/סטטוס נעשה דרך רשומת המועמד המקושרת.
 */
@Injectable()
export class MailingService {
  private readonly logger = new Logger(MailingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly shabbat: ShabbatService,
    private readonly config: ConfigService,
  ) {}

  /** מצב שבת/חג נוכחי — לאינדיקטור חי בדשבורד (קריאה בלבד, אינו משנה לוגיקה). */
  async shabbatStatus(): Promise<{ forbidden: boolean; until: string | null }> {
    const forbidden = await this.shabbat.isForbidden();
    const until = forbidden
      ? (await this.shabbat.nextAllowedSendTime()).toISOString()
      : null;
    return { forbidden, until };
  }

  /**
   * דיוור "משרה חדשה רלוונטית" (סעיף 8.2) — למנויים שתחומם תואם למשרה.
   * דבר פרסומת → רק למנויים עם הסכמה (subscribers() מסנן optInMarketing).
   * נחסם בשבת/חג (יישלח ידנית מאוחר יותר). מחזיר כמה מיילים נשלחו.
   */
  async notifyNewJob(job: {
    id: string;
    title: string;
    field: JobField;
    region: string;
    scope: string;
    experience?: string | null;
  }): Promise<number> {
    if (await this.shabbat.isForbidden()) return 0;

    const recipients = await this.subscribers({ field: job.field });
    if (recipients.length === 0) return 0;

    const appUrl = this.config.get<string>(
      "APP_URL",
      "https://der-shtele.vercel.app",
    );
    const link = `${appUrl}/jobs/${job.id}`;
    const meta = [job.region, job.scope, job.experience]
      .filter(Boolean)
      .map((s) => escapeHtml(String(s)))
      .join(" · ");
    const html = this.email.wrap(
      `<p style="margin:0 0 14px">שלום,</p>
       <p style="margin:0 0 14px">עלתה משרה חדשה שעשויה להתאים לך:</p>
       <p style="font-size:18px;font-weight:bold;margin:0 0 4px;color:#1F3A5F">${escapeHtml(job.title)}</p>
       <p style="margin:0;color:#8C8475">${meta}</p>
       ${this.email.button(link, "לצפייה בפרטים ולהגשה ←")}`,
      {
        heading: "משרה חדשה עבורך",
        preheader: `${job.title} — ${meta}`,
        footerNote:
          "קיבלת מייל זה כי נרשמת לעדכונים בדער שטעלע. לביטול — מהאזור האישי באתר.",
      },
    );

    let sent = 0;
    for (const r of recipients) {
      try {
        await this.email.send({
          to: r.email,
          subject: `משרה חדשה: ${job.title}`,
          html,
        });
        sent += 1;
      } catch (err) {
        this.logger.error(`כשל בשליחה אל ${r.email}`, err as Error);
      }
    }
    this.logger.log(`דיוור משרה חדשה "${job.title}": נשלח ל-${sent} מנויים`);
    return sent;
  }

  /**
   * רשימת מנויים פעילים (הסכמה תקפה), עם נתוני פילוח לדיוור מותאם.
   * עדיפות לפרטי הפרופיל שהמשתמש מילא בעצמו (city / preferredField);
   * אם לא מילא — נופלים לרשומת המועמד המקושרת (field / region).
   * סטטוס קיים רק ברמת המועמד.
   */
  async subscribers(filter: MailingFilterDto = {}): Promise<Subscriber[]> {
    const and: Prisma.UserWhereInput[] = [];

    // תחום: התאמה לתחום שהמשתמש ביקש, או — אם לא הוגדר — לתחום המועמד.
    if (filter.field) {
      and.push({
        OR: [
          { preferredField: filter.field },
          {
            preferredField: null,
            candidate: { is: { field: filter.field } },
          },
        ],
      });
    }
    // אזור: התאמה לעיר המגורים שהמשתמש מילא, או — אם לא מילא — לאזור המועמד.
    if (filter.region) {
      and.push({
        OR: [
          { city: filter.region },
          { city: null, candidate: { is: { region: filter.region } } },
        ],
      });
    }
    // סטטוס מתקיים רק ברמת המועמד.
    if (filter.status) {
      and.push({ candidate: { is: { status: filter.status } } });
    }

    const users = await this.prisma.user.findMany({
      where: {
        optInMarketing: true,
        ...(and.length ? { AND: and } : {}),
      },
      orderBy: { optInAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        optInAt: true,
        city: true,
        preferredField: true,
        candidate: {
          select: { field: true, region: true, status: true },
        },
      },
    });

    return users.map((u) => ({
      userId: u.id,
      email: u.email,
      fullName: u.fullName,
      optInAt: u.optInAt,
      field: u.preferredField ?? u.candidate?.field ?? null,
      region: u.city ?? u.candidate?.region ?? null,
      status: u.candidate?.status ?? null,
    }));
  }

  /**
   * שליחה ידנית לרשימת התפוצה (או לקבוצה מסוננת).
   * אוכף את כלל השבת — לא שולחים בשבת/חג.
   */
  async send(dto: SendMailingDto): Promise<{ total: number; sent: number }> {
    if (await this.shabbat.isForbidden()) {
      throw new BadRequestException(
        "לא ניתן לשלוח מיילים בשבת או ביום טוב — נסה שוב לאחר צאת השבת/החג",
      );
    }

    const recipients = await this.subscribers(dto.filter ?? {});
    if (recipients.length === 0) {
      throw new BadRequestException("אין מנויים פעילים התואמים לסינון שנבחר");
    }

    const html = this.wrapBody(dto.body);
    let sent = 0;
    for (const r of recipients) {
      try {
        await this.email.send({ to: r.email, subject: dto.subject, html });
        sent += 1;
      } catch (err) {
        this.logger.error(`כשל בשליחה אל ${r.email}`, err as Error);
      }
    }

    return { total: recipients.length, sent };
  }

  /** עוטף טקסט חופשי בתבנית הממותגת (escapeHtml + שמירת שורות). */
  private wrapBody(body: string): string {
    const safe = escapeHtml(body).replace(/\n/g, "<br/>");
    return this.email.wrap(`<div>${safe}</div>`, {
      footerNote:
        "קיבלת מייל זה כי נרשמת לעדכונים בדער שטעלע. לביטול — מהאזור האישי באתר.",
    });
  }
}
