import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { isCommissionDue } from '../../common/commission/commission';

/**
 * עמלות — נשמרות על מודל Placement (commissionAmount, commissionStatus).
 * המודול הזה נותן מבט ייעודי על העמלות + עדכון סטטוס תשלום.
 */
@Injectable()
export class CommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** כל הגיוסים עם עמלה, ממוין לפי תאריך. */
  findAll() {
    return this.prisma.placement.findMany({
      where: { commissionAmount: { not: null } },
      select: this.select,
      orderBy: { placedAt: 'desc' },
    });
  }

  /** עמלות שטרם נגבו (due). */
  async findDue() {
    const placements = await this.prisma.placement.findMany({
      where: { commissionAmount: { not: null } },
      select: this.select,
    });
    return placements.filter((p) =>
      isCommissionDue(p.status, p.commissionStatus),
    );
  }

  /** סיכום: כמה כסף ממתין לגבייה. */
  async summary() {
    const due = await this.findDue();
    const pendingTotal = due.reduce(
      (sum, p) => sum + (p.commissionAmount ?? 0),
      0,
    );
    return { count: due.length, pendingTotal };
  }

  async updateStatus(placementId: string, dto: UpdateCommissionDto) {
    const placement = await this.prisma.placement.findUnique({
      where: { id: placementId },
    });
    if (!placement) throw new NotFoundException('גיוס לא נמצא');
    return this.prisma.placement.update({
      where: { id: placementId },
      data: { commissionStatus: dto.status },
      select: this.select,
    });
  }

  private readonly select = {
    id: true,
    commissionAmount: true,
    commissionStatus: true,
    status: true,
    placedAt: true,
    guaranteeEndsAt: true,
    job: { select: { id: true, title: true } },
    employer: { select: { id: true, companyName: true } },
  };
}
