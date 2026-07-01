import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  isCommissionDue,
  effectiveCommissionStatus,
} from "../../common/commission/commission";

/**
 * שירות לוח הבקרה — מרכז את כל מדדי הצוות במקום אחד (סעיף 7.1 באיפיון).
 * אין כתיבה — קריאה בלבד, אגרגציה על שאר הטבלאות.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** תמונת מצב מלאה ללוח הבקרה הראשי. */
  async summary() {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      newCandidatesThisWeek,
      activeCandidates,
      activeJobsCount,
      placementsThisMonth,
      overdueReminders,
      activeSubscribers,
      queue,
      activeJobsList,
      openReminders,
      duePlacements,
      newContactsCount,
      queueCount,
    ] = await Promise.all([
      // קו"ח שנכנסו השבוע
      this.prisma.candidate.count({ where: { createdAt: { gte: weekAgo } } }),
      // מועמדים פעילים (בטיפול)
      this.prisma.candidate.count({
        where: { status: { in: ["new", "in_progress", "presented"] } },
      }),
      // משרות פעילות
      this.prisma.job.count({ where: { status: "active" } }),
      // גיוסים החודש
      this.prisma.placement.count({
        where: { placedAt: { gte: startOfMonth } },
      }),
      // תזכורות שעבר זמנן
      this.prisma.reminder.count({
        where: { done: false, remindAt: { lt: now } },
      }),
      // מנויי מייל פעילים (הסכמה תקפה)
      this.prisma.user.count({ where: { optInMarketing: true } }),
      // תור טיפול — מועמדים חדשים שטרם טופלו, לפי סדר הגעה
      this.prisma.candidate.findMany({
        where: { status: "new" },
        orderBy: { createdAt: "asc" },
        take: 10,
        select: {
          id: true,
          fullName: true,
          field: true,
          region: true,
          createdAt: true,
          // לאיזו משרה הוגש המועמד (אם בכלל) — להצגה בתור הטיפול
          presentations: {
            orderBy: { presentedAt: "desc" },
            take: 1,
            select: { job: { select: { id: true, title: true } } },
          },
        },
      }),
      // משרות פעילות + כמה מועמדים הוצגו לכל אחת
      this.prisma.job.findMany({
        where: { status: "active" },
        orderBy: { openedAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          field: true,
          region: true,
          _count: { select: { presentations: true } },
        },
      }),
      // תזכורות פתוחות
      this.prisma.reminder.findMany({
        where: { done: false },
        orderBy: { remindAt: "asc" },
        take: 10,
      }),
      // עמלות פתוחות — לחישוב סכום
      this.prisma.placement.findMany({
        where: { commissionAmount: { not: null } },
        select: {
          commissionAmount: true,
          commissionStatus: true,
          status: true,
          guaranteeEndsAt: true,
        },
      }),
      // פניות שטרם טופלו (handledAt = null)
      this.prisma.contact.count({ where: { handledAt: null } }),
      // תור טיפול — מספר מדויק (לא מוגבל ל-10 כמו הרשימה)
      this.prisma.candidate.count({ where: { status: "new" } }),
    ]);

    // סכום עמלות פתוחות (בשקלים) — רק עמלות שכבר ניתנות לגבייה (תום ערבות)
    const pendingCommissions = duePlacements
      .filter((p) =>
        isCommissionDue(p.status, p.commissionStatus, p.guaranteeEndsAt),
      )
      .reduce((sum, p) => sum + (p.commissionAmount ?? 0), 0);

    // עמלות בשלות לחיוב = סטטוס אפקטיבי 'due' (הערבות הסתיימה, טרם הופקה חשבונית)
    const commissionsDueCount = duePlacements.filter(
      (p) =>
        effectiveCommissionStatus(
          p.status,
          p.commissionStatus,
          p.guaranteeEndsAt,
        ) === "due",
    ).length;

    return {
      stats: {
        newCandidatesThisWeek,
        activeCandidates,
        activeJobs: activeJobsCount,
        placementsThisMonth,
        pendingCommissions,
        overdueReminders,
        activeSubscribers,
        queueCount,
        commissionsDueCount,
        newContactsCount,
      },
      queue: queue.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        field: c.field,
        region: c.region,
        createdAt: c.createdAt,
        job: c.presentations[0]?.job ?? null,
      })),
      activeJobs: activeJobsList.map((j) => ({
        id: j.id,
        title: j.title,
        field: j.field,
        region: j.region,
        presentedCount: j._count.presentations,
      })),
      openReminders,
    };
  }
}
