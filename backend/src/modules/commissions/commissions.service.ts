import { Injectable, NotFoundException } from "@nestjs/common";
import { CommissionStatus, PlacementEventType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateCommissionDto } from "./dto/update-commission.dto";
import { isCommissionDue } from "../../common/commission/commission";

// מיפוי סטטוס עמלה → סוג אירוע בלוג
const COMMISSION_EVENT: Record<CommissionStatus, PlacementEventType | null> = {
  pending: null,
  invoiced: PlacementEventType.commission_invoiced,
  paid: PlacementEventType.commission_paid,
  partial_refund: PlacementEventType.commission_refunded,
};

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
      orderBy: { placedAt: "desc" },
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

  async updateStatus(
    placementId: string,
    dto: UpdateCommissionDto,
    createdBy?: string,
  ) {
    const placement = await this.prisma.placement.findUnique({
      where: { id: placementId },
    });
    if (!placement) throw new NotFoundException("גיוס לא נמצא");

    const changed = dto.status !== placement.commissionStatus;
    const evt = changed ? COMMISSION_EVENT[dto.status] : null;

    return this.prisma.placement.update({
      where: { id: placementId },
      data: {
        commissionStatus: dto.status,
        ...(evt ? { events: { create: { type: evt, createdBy } } } : {}),
      },
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
    events: { orderBy: { createdAt: "asc" as const } },
  };
}
