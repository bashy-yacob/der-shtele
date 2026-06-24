import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CommissionStatus, PlacementEventType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateCommissionDto } from "./dto/update-commission.dto";
import {
  buildInvoiceNumber,
  effectiveCommissionStatus,
  isCommissionDue,
  isGuaranteeOver,
} from "../../common/commission/commission";
import { assertCommissionTransition } from "../../common/status-machine/status-machine";

// מיפוי סטטוס עמלה → סוג אירוע בלוג
const COMMISSION_EVENT: Record<CommissionStatus, PlacementEventType | null> = {
  not_due: null,
  due: PlacementEventType.commission_due,
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
      isCommissionDue(p.status, p.commissionStatus, p.guaranteeEndsAt),
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

    // חוק ברזל: אסור לחייב / לסמן כשולם לפני תום תקופת הערבות (3 חודשים).
    if (
      (dto.status === "invoiced" || dto.status === "paid") &&
      !isGuaranteeOver(placement.guaranteeEndsAt)
    ) {
      throw new BadRequestException(
        "לא ניתן לחייב או לסמן עמלה כשולמה לפני תום תקופת הערבות (3 חודשים)",
      );
    }

    // הסטטוס האפקטיבי — מקדם not_due→due אם הערבות כבר הסתיימה, גם אם הקרון
    // היומי טרם רץ. כך המעבר ל-invoiced/paid תקף גם במצב ביניים.
    const current = effectiveCommissionStatus(
      placement.status,
      placement.commissionStatus,
      placement.guaranteeEndsAt,
    );
    assertCommissionTransition(current, dto.status);

    const changed = dto.status !== placement.commissionStatus;
    const evt = changed ? COMMISSION_EVENT[dto.status] : null;
    // חשבונית אוטומטית (סעיף 7.4) — במעבר ל-invoiced נוצרת חשבונית ממוספרת
    // ומתועדת בלוג הגיוס (לא רק עמוד הדפסה).
    const note =
      dto.status === "invoiced"
        ? `נוצרה חשבונית מס׳ ${buildInvoiceNumber(placement.id)}`
        : undefined;

    return this.prisma.placement.update({
      where: { id: placementId },
      data: {
        commissionStatus: dto.status,
        ...(evt
          ? { events: { create: { type: evt, note, createdBy } } }
          : {}),
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
