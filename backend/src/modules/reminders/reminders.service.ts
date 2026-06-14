import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

/** תזכורות לצוות — שיחות חוזרות, מעקב מועמדים וכו'. */
@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeDone = false) {
    return this.prisma.reminder.findMany({
      where: includeDone ? undefined : { done: false },
      orderBy: { remindAt: 'asc' },
    });
  }

  /** תזכורות שעבר זמנן וטרם טופלו. */
  findOverdue() {
    return this.prisma.reminder.findMany({
      where: { done: false, remindAt: { lt: new Date() } },
      orderBy: { remindAt: 'asc' },
    });
  }

  create(dto: CreateReminderDto) {
    return this.prisma.reminder.create({
      data: {
        message: dto.message,
        remindAt: new Date(dto.remindAt),
        createdBy: dto.createdBy,
        candidateId: dto.candidateId,
        jobId: dto.jobId,
      },
    });
  }

  async update(id: string, dto: UpdateReminderDto) {
    await this.ensureExists(id);
    return this.prisma.reminder.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.remindAt ? { remindAt: new Date(dto.remindAt) } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.reminder.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const reminder = await this.prisma.reminder.findUnique({ where: { id } });
    if (!reminder) throw new NotFoundException('תזכורת לא נמצאה');
    return reminder;
  }
}
