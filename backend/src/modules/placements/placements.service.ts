import { Injectable, NotFoundException } from "@nestjs/common";
import { PlacementEventType, PlacementStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePlacementDto } from "./dto/create-placement.dto";
import { UpdatePlacementDto } from "./dto/update-placement.dto";
import { assertPlacementTransition } from "../../common/status-machine/status-machine";
import {
  calcGuaranteeEnd,
  deriveCommissionStatus,
} from "../../common/commission/commission";

// מיפוי סטטוס גיוס → סוג אירוע בלוג
const STATUS_EVENT: Record<PlacementStatus, PlacementEventType | null> = {
  pending: null,
  confirmed: PlacementEventType.confirmed,
  guarantee: PlacementEventType.guarantee,
  completed: PlacementEventType.completed,
  cancelled: PlacementEventType.cancelled,
};

@Injectable()
export class PlacementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.placement.findMany({
      include: {
        job: { select: { id: true, title: true } },
        candidate: { select: { id: true, fullName: true } },
        employer: { select: { id: true, companyName: true } },
      },
      orderBy: { placedAt: "desc" },
    });
  }

  async findOne(id: string) {
    const placement = await this.prisma.placement.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: true,
        employer: true,
        events: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!placement) throw new NotFoundException("גיוס לא נמצא");
    return placement;
  }

  /** יוצר גיוס + מחשב תאריך סיום ערבות (placedAt + 3 חודשים) + רושם אירוע פתיחה. */
  async create(dto: CreatePlacementDto, createdBy?: string) {
    const placedAt = new Date();
    return this.prisma.placement.create({
      data: {
        jobId: dto.jobId,
        candidateId: dto.candidateId,
        employerId: dto.employerId,
        commissionAmount: dto.commissionAmount,
        notes: dto.notes,
        placedAt,
        guaranteeEndsAt: calcGuaranteeEnd(placedAt),
        events: {
          create: {
            type: "created",
            note: dto.commissionAmount
              ? `גיוס נרשם · עמלה ₪${dto.commissionAmount.toLocaleString("he-IL")}`
              : "גיוס נרשם",
            createdBy,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdatePlacementDto, createdBy?: string) {
    const placement = await this.findOne(id);

    let commissionStatus = placement.commissionStatus;
    const statusChanged = !!dto.status && dto.status !== placement.status;
    if (statusChanged) {
      assertPlacementTransition(placement.status, dto.status!);
      // ביטול בתוך ערבות → החזר חלקי
      commissionStatus = deriveCommissionStatus(
        dto.status!,
        placement.commissionStatus,
        placement.guaranteeEndsAt,
      );
    }

    // איסוף אירועים לרישום בלוג (היסטוריה אמיתית)
    const events: { type: PlacementEventType; note?: string }[] = [];
    if (statusChanged) {
      const evt = STATUS_EVENT[dto.status!];
      if (evt) events.push({ type: evt });
      // ביטול שגרר החזר חלקי — רישום נפרד שמסביר את שינוי העמלה
      if (commissionStatus === "partial_refund") {
        events.push({
          type: "commission_refunded",
          note: "החזר חלקי למעסיק (ביטול בתוך ערבות)",
        });
      }
    }
    if (
      dto.commissionAmount !== undefined &&
      dto.commissionAmount !== placement.commissionAmount
    ) {
      events.push({
        type: "amount_updated",
        note: `סכום עמלה עודכן ל-₪${dto.commissionAmount.toLocaleString("he-IL")}`,
      });
    }

    return this.prisma.placement.update({
      where: { id },
      data: {
        status: dto.status,
        commissionStatus,
        commissionAmount: dto.commissionAmount,
        notes: dto.notes,
        ...(events.length
          ? { events: { create: events.map((e) => ({ ...e, createdBy })) } }
          : {}),
      },
    });
  }
}
