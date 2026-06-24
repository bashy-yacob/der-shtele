import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { escapeHtml } from "../../common/util/escape-html";

export interface DailyTasksResult {
  promotedCommissions: number;
  digestSent: boolean;
}

/**
 * משימות יומיות (סעיף 7.4 + 8.2):
 * 1. קידום עמלות not_due → due בתום תקופת הערבות (3 חודשים) + תזכורת גבייה.
 * 2. דייג'סט יומי לצוות — תזכורות שהגיע זמנן + שיחות חוזרות להיום.
 *
 * רץ אוטומטית כל יום ב-06:00. בנוסף ניתן להפעלה ידנית דרך POST /tasks/run-daily
 * (עם TASKS_SECRET) — חיוני כי Render free מרדים את השרת והקרון הפנימי לא יורה.
 */
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async runDaily(): Promise<DailyTasksResult> {
    const promotedCommissions = await this.promoteDueCommissions();
    const digestSent = await this.sendTeamDigest();
    this.logger.log(
      `משימות יומיות הושלמו — ${promotedCommissions} עמלות קודמו ל-due, digest=${digestSent}`,
    );
    return { promotedCommissions, digestSent };
  }

  /**
   * מקדם עמלות שהערבות שלהן הסתיימה (not_due → due), רושם אירוע בלוג הגיוס,
   * ויוצר תזכורת גבייה אחת לצוות לכל גיוס כזה.
   */
  private async promoteDueCommissions(): Promise<number> {
    const now = new Date();
    const placements = await this.prisma.placement.findMany({
      where: {
        commissionStatus: "not_due",
        status: { in: ["confirmed", "guarantee", "completed"] },
        guaranteeEndsAt: { lte: now },
        commissionAmount: { not: null },
      },
      include: {
        job: { select: { title: true } },
        employer: { select: { companyName: true } },
      },
    });

    for (const p of placements) {
      const amount = (p.commissionAmount ?? 0).toLocaleString("he-IL");
      const label = `${p.employer?.companyName ?? "מעסיק"} / ${p.job?.title ?? "משרה"}`;
      await this.prisma.placement.update({
        where: { id: p.id },
        data: {
          commissionStatus: "due",
          events: {
            create: {
              type: "commission_due",
              note: "תום ערבות — העמלה ניתנת לגבייה",
              createdBy: "מערכת",
            },
          },
        },
      });
      await this.prisma.reminder.create({
        data: {
          message: `גביית עמלה — ${label} (₪${amount})`,
          remindAt: now,
          createdBy: "מערכת",
        },
      });
    }
    return placements.length;
  }

  /**
   * שולח לצוות דייג'סט של מה שדורש טיפול היום: תזכורות פתוחות שהגיע זמנן +
   * שיחות חוזרות שתאריך החזרה שלהן הוא היום. מחזיר אם נשלח מייל בכלל.
   */
  private async sendTeamDigest(): Promise<boolean> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [dueReminders, dueCalls] = await Promise.all([
      // תזכורות פתוחות שהגיע זמנן — חוזרות מדי יום עד שמסומנות "טופל".
      this.prisma.reminder.findMany({
        where: { done: false, remindAt: { lte: now } },
        orderBy: { remindAt: "asc" },
        take: 50,
      }),
      // שיחות חוזרות שתאריך החזרה שלהן הוא היום — פעם אחת ביום החזרה.
      this.prisma.callLog.findMany({
        where: { followUpAt: { gte: startOfDay, lt: endOfDay } },
        orderBy: { followUpAt: "asc" },
        take: 50,
        include: { candidate: { select: { fullName: true, phone: true } } },
      }),
    ]);

    if (dueReminders.length === 0 && dueCalls.length === 0) return false;

    const remindersHtml = dueReminders.length
      ? `<h3 style="margin:16px 0 4px">תזכורות (${dueReminders.length})</h3>
         <ul>${dueReminders
           .map((r) => `<li>${escapeHtml(r.message)}</li>`)
           .join("")}</ul>`
      : "";
    const callsHtml = dueCalls.length
      ? `<h3 style="margin:16px 0 4px">שיחות חוזרות להיום (${dueCalls.length})</h3>
         <ul>${dueCalls
           .map(
             (c) =>
               `<li>${escapeHtml(c.candidate?.fullName ?? "מועמד")} — ${escapeHtml(
                 c.candidate?.phone ?? "",
               )}: ${escapeHtml(c.summary)}</li>`,
           )
           .join("")}</ul>`
      : "";

    await this.email.notifyTeam(
      "תזכורות לטיפול היום",
      `<div dir="rtl" style="font-family:Arial,sans-serif">${remindersHtml}${callsHtml}</div>`,
    );
    return true;
  }
}
