import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { assertJobTransition } from '../../common/status-machine/status-machine';

// השדות הציבוריים בלבד — לעולם לא חושפים employer / descriptionInternal
const PUBLIC_SELECT = {
  id: true,
  title: true,
  descriptionPublic: true,
  field: true,
  region: true,
  scope: true,
  openedAt: true,
} satisfies Prisma.JobSelect;

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /** לוח המשרות הציבורי — רק משרות פעילות, שדות ציבוריים בלבד. */
  findPublic(query: QueryJobsDto) {
    return this.prisma.job.findMany({
      where: {
        status: 'active',
        ...(query.field && { field: query.field }),
        ...(query.region && { region: query.region }),
      },
      select: PUBLIC_SELECT,
      orderBy: { openedAt: 'desc' },
    });
  }

  /** משרה ציבורית בודדת. */
  async findPublicOne(id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, status: 'active' },
      select: PUBLIC_SELECT,
    });
    if (!job) throw new NotFoundException('משרה לא נמצאה');
    return job;
  }

  // ---- פנימי (צוות) ----

  findAll() {
    return this.prisma.job.findMany({
      include: { employer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { employer: true, presentations: true },
    });
    if (!job) throw new NotFoundException('משרה לא נמצאה');
    return job;
  }

  create(dto: CreateJobDto) {
    return this.prisma.job.create({ data: dto });
  }

  async update(id: string, dto: UpdateJobDto) {
    const job = await this.findOne(id);
    if (dto.status && dto.status !== job.status) {
      assertJobTransition(job.status, dto.status);
    }
    return this.prisma.job.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status === 'closed' || dto.status === 'filled'
          ? { closedAt: new Date() }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.job.delete({ where: { id } });
    return { id };
  }
}
