import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CandidateStatus, JobField, Prisma, Region } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { isShabbatOrHoliday } from '../../common/shabbat/shabbat';
import { escapeHtml } from '../../common/util/escape-html';
import { SendMailingDto, MailingFilterDto } from './dto/send-mailing.dto';

export interface Subscriber {
  userId: string;
  email: string;
  fullName: string;
  optInAt: Date | null;
  field: JobField | null;
  region: Region | null;
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
  ) {}

  /** רשימת מנויים פעילים (הסכמה תקפה) + פרטי המועמד המקושר לסינון. */
  async subscribers(filter: MailingFilterDto = {}): Promise<Subscriber[]> {
    // סינון על שדות המועמד המקושר — מחייב מועמד תואם כשניתן פילטר.
    const candidateFilter: Prisma.CandidateWhereInput = {};
    if (filter.field) candidateFilter.field = filter.field;
    if (filter.region) candidateFilter.region = filter.region;
    if (filter.status) candidateFilter.status = filter.status;
    const hasCandidateFilter = Object.keys(candidateFilter).length > 0;

    const users = await this.prisma.user.findMany({
      where: {
        optInMarketing: true,
        ...(hasCandidateFilter
          ? { candidate: { is: candidateFilter } }
          : {}),
      },
      orderBy: { optInAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        optInAt: true,
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
      field: u.candidate?.field ?? null,
      region: u.candidate?.region ?? null,
      status: u.candidate?.status ?? null,
    }));
  }

  /**
   * שליחה ידנית לרשימת התפוצה (או לקבוצה מסוננת).
   * אוכף את כלל השבת — לא שולחים בשבת/חג.
   */
  async send(dto: SendMailingDto): Promise<{ total: number; sent: number }> {
    if (isShabbatOrHoliday()) {
      throw new BadRequestException(
        'לא ניתן לשלוח מיילים בשבת או ביום טוב — נסה שוב לאחר צאת השבת/החג',
      );
    }

    const recipients = await this.subscribers(dto.filter ?? {});
    if (recipients.length === 0) {
      throw new BadRequestException('אין מנויים פעילים התואמים לסינון שנבחר');
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

  /** עוטף טקסט חופשי בתבנית RTL בטוחה (escapeHtml + שמירת שורות). */
  private wrapBody(body: string): string {
    const safe = escapeHtml(body).replace(/\n/g, '<br/>');
    return `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.6">
      ${safe}
      <hr style="margin-top:24px;border:none;border-top:1px solid #eee"/>
      <p style="font-size:12px;color:#888">
        קיבלת מייל זה כי נרשמת לעדכונים בדער שטעלע.
        לביטול קבלת עדכונים — מהאזור האישי באתר.
      </p>
    </div>`;
  }
}
