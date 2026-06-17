import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { isCommissionDue } from '../../common/commission/commission';

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
    ] = await Promise.all([
      // קו"ח שנכנסו השבוע
      this.prisma.candidate.count({ where: { createdAt: { gte: weekAgo } } }),
      // מועמדים פעילים (בטיפול)
      this.prisma.candidate.count({
        where: { status: { in: ['new', 'in_progress', 'presented'] } },
      }),
      // משרות פעילות
      this.prisma.job.count({ where: { status: 'active' } }),
      // גיוסים החודש
      this.prisma.placement.count({ where: { placedAt: { gte: startOfMonth } } }),
      // תזכורות שעבר זמנן
      this.prisma.reminder.count({
        where: { done: false, remindAt: { lt: now } },
      }),
      // מנויי מייל פעילים (הסכמה תקפה)
      this.prisma.user.count({ where: { optInMarketing: true } }),
      // תור טיפול — מועמדים חדשים שטרם טופלו, לפי סדר הגעה
      this.prisma.candidate.findMany({
        where: { status: 'new' },
        orderBy: { createdAt: 'asc' },
        take: 10,
        select: {
          id: true,
          fullName: true,
          field: true,
          region: true,
          createdAt: true,
        },
      }),
      // משרות פעילות + כמה מועמדים הוצגו לכל אחת
      this.prisma.job.findMany({
        where: { status: 'active' },
        orderBy: { openedAt: 'desc' },
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
        orderBy: { remindAt: 'asc' },
        take: 10,
      }),
      // עמלות פתוחות — לחישוב סכום
      this.prisma.placement.findMany({
        where: { commissionAmount: { not: null } },
        select: {
          commissionAmount: true,
          commissionStatus: true,
          status: true,
        },
      }),
    ]);

    // סכום עמלות פתוחות (בשקלים) — לפי לוגיקת isCommissionDue הקיימת
    const pendingCommissions = duePlacements
      .filter((p) => isCommissionDue(p.status, p.commissionStatus))
      .reduce((sum, p) => sum + (p.commissionAmount ?? 0), 0);

    return {
      stats: {
        newCandidatesThisWeek,
        activeCandidates,
        activeJobs: activeJobsCount,
        placementsThisMonth,
        pendingCommissions,
        overdueReminders,
        activeSubscribers,
        queueCount: queue.length,
      },
      queue,
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
