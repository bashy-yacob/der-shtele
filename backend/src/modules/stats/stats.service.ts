import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * מדדים ציבוריים אגרגטיביים לעמוד הבית — ספירות בלבד, ללא פרטים מזהים.
 * זהות המעסיקים נשארת פנימית; כאן נחשף רק מספר כולל.
 */
@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /** ספירות לתצוגה ב-Hero. כרגע: מספר המעסיקים המאושרים שעובדים איתנו. */
  async getPublicStats() {
    const employers = await this.prisma.employer.count({
      where: { status: "approved" },
    });
    return { employers };
  }
}
