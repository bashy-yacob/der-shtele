import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

/** משרות שמורות — מועמד רשום שומר ♡ משרה להגשה מאוחר יותר. */
@Injectable()
export class SavedJobsService {
  constructor(private readonly prisma: PrismaService) {}

  /** רשימת המשרות ששמר המשתמש — כולל פרטי המשרה והסטטוס (לסימון "לא פעילה"). */
  async listForUser(userId: string) {
    const saved = await this.prisma.savedJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            descriptionPublic: true,
            field: true,
            region: true,
            scope: true,
            status: true,
            openedAt: true,
          },
        },
      },
    });
    return saved.map((s) => ({ savedAt: s.createdAt, job: s.job }));
  }

  /** רק מזהי המשרות השמורות — לסימון מצב הלב ברשימות. */
  async listJobIds(userId: string) {
    const saved = await this.prisma.savedJob.findMany({
      where: { userId },
      select: { jobId: true },
    });
    return saved.map((s) => s.jobId);
  }

  /** שמירת משרה — אידמפוטנטי: שמירה חוזרת לא זורקת שגיאה. */
  async save(userId: string, jobId: string) {
    try {
      await this.prisma.savedJob.create({ data: { userId, jobId } });
    } catch (err) {
      // @@unique([userId, jobId]) — כבר שמור, מתעלמים
      if (
        !(
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        )
      ) {
        throw err;
      }
    }
    return { saved: true };
  }

  /** הסרת משרה מהשמורות — אידמפוטנטי. */
  async unsave(userId: string, jobId: string) {
    await this.prisma.savedJob.deleteMany({ where: { userId, jobId } });
    return { saved: false };
  }
}
