import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
import { assertPlacementTransition } from '../../common/status-machine/status-machine';
import {
  calcGuaranteeEnd,
  deriveCommissionStatus,
} from '../../common/commission/commission';

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
      orderBy: { placedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const placement = await this.prisma.placement.findUnique({
      where: { id },
      include: { job: true, candidate: true, employer: true },
    });
    if (!placement) throw new NotFoundException('גיוס לא נמצא');
    return placement;
  }

  /** יוצר גיוס + מחשב תאריך סיום ערבות (placedAt + 3 חודשים). */
  create(dto: CreatePlacementDto) {
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
      },
    });
  }

  async update(id: string, dto: UpdatePlacementDto) {
    const placement = await this.findOne(id);

    let commissionStatus = placement.commissionStatus;
    if (dto.status && dto.status !== placement.status) {
      assertPlacementTransition(placement.status, dto.status);
      // ביטול בתוך ערבות → החזר חלקי
      commissionStatus = deriveCommissionStatus(
        dto.status,
        placement.commissionStatus,
        placement.guaranteeEndsAt,
      );
    }

    return this.prisma.placement.update({
      where: { id },
      data: {
        status: dto.status,
        commissionStatus,
        commissionAmount: dto.commissionAmount,
        notes: dto.notes,
      },
    });
  }
}
