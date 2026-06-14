import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';

/** מעסיקים — פנימי לחלוטין, לעולם לא חשוף לאתר הציבורי. */
@Injectable()
export class EmployersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.employer.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const employer = await this.prisma.employer.findUnique({
      where: { id },
      include: { jobs: true },
    });
    if (!employer) throw new NotFoundException('מעסיק לא נמצא');
    return employer;
  }

  create(dto: CreateEmployerDto) {
    return this.prisma.employer.create({ data: dto });
  }

  async update(id: string, dto: UpdateEmployerDto) {
    await this.findOne(id);
    return this.prisma.employer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.employer.delete({ where: { id } });
    return { id };
  }
}
