import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

/** Applications = JobPresentation — הצגת מועמד למשרה ספציפית. */
@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.jobPresentation.findMany({
      include: {
        candidate: { select: { id: true, fullName: true, phone: true } },
        job: { select: { id: true, title: true } },
      },
      orderBy: { presentedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const presentation = await this.prisma.jobPresentation.findUnique({
      where: { id },
      include: { candidate: true, job: true },
    });
    if (!presentation) throw new NotFoundException('הצגה לא נמצאה');
    return presentation;
  }

  async create(dto: CreateApplicationDto) {
    try {
      return await this.prisma.jobPresentation.create({ data: dto });
    } catch (err) {
      // @@unique([jobId, candidateId]) — מועמד לא יוצג פעמיים לאותה משרה
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('המועמד כבר הוצג למשרה זו');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateApplicationDto) {
    await this.findOne(id);
    return this.prisma.jobPresentation.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.jobPresentation.delete({ where: { id } });
    return { id };
  }
}
