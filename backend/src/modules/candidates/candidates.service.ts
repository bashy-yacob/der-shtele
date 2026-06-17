import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { StorageService } from '../../common/storage/storage.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CreateCallLogDto } from './dto/create-call-log.dto';
import { assertCandidateTransition } from '../../common/status-machine/status-machine';
import { escapeHtml } from '../../common/util/escape-html';

@Injectable()
export class CandidatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly storage: StorageService,
  ) {}

  /** הגשת מועמדות מהאתר — יוצר מועמד, מודיע לצוות, שולח אישור. */
  async createFromApplication(dto: CreateCandidateDto) {
    const candidate = await this.prisma.candidate.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        city: dto.city ?? '',
        field: dto.field,
        region: dto.region,
        notes: dto.notes,
        cvUrl: dto.cvPath,
        cvUploadedAt: dto.cvPath ? new Date() : null,
      },
    });

    // אם הוגש על משרה ספציפית — יוצר הצגה ראשונית
    if (dto.jobId) {
      await this.prisma.jobPresentation
        .create({ data: { jobId: dto.jobId, candidateId: candidate.id } })
        .catch(() => undefined); // משרה לא קיימת — מתעלמים בשקט
    }

    await this.email.notifyTeam(
      'מועמד חדש',
      `<div dir="rtl">מועמד חדש: <b>${escapeHtml(dto.fullName)}</b> (${escapeHtml(dto.phone)}, ${escapeHtml(dto.email)})</div>`,
    );
    await this.email.sendCandidateConfirmation(dto.email, dto.fullName);

    return { id: candidate.id };
  }

  // ---- CRM (צוות) ----

  findAll() {
    return this.prisma.candidate.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        callLogs: { orderBy: { calledAt: 'desc' } },
        presentations: {
          orderBy: { presentedAt: 'desc' },
          include: { job: { select: { id: true, title: true } } },
        },
        placements: {
          orderBy: { placedAt: 'desc' },
          include: {
            job: { select: { id: true, title: true } },
            employer: { select: { id: true, companyName: true } },
          },
        },
      },
    });
    if (!candidate) throw new NotFoundException('מועמד לא נמצא');
    return candidate;
  }

  /** הוספת רשומת שיחה ידנית לכרטיס המועמד. */
  async addCallLog(id: string, dto: CreateCallLogDto) {
    await this.ensureExists(id);
    return this.prisma.callLog.create({
      data: {
        candidateId: id,
        staffName: dto.staffName,
        summary: dto.summary,
        followUpAt: dto.followUpAt ? new Date(dto.followUpAt) : null,
      },
    });
  }

  private async ensureExists(id: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException('מועמד לא נמצא');
    return candidate;
  }

  async update(id: string, dto: UpdateCandidateDto) {
    const candidate = await this.findOne(id);
    if (dto.status && dto.status !== candidate.status) {
      assertCandidateTransition(candidate.status, dto.status);
    }
    return this.prisma.candidate.update({ where: { id }, data: dto });
  }

  /** signed URL זמני לצפייה בקו"ח (צוות בלבד). */
  async getResumeUrl(id: string) {
    const candidate = await this.findOne(id);
    if (!candidate.cvUrl) throw new NotFoundException('אין קורות חיים למועמד זה');
    const url = await this.storage.getSignedUrl(candidate.cvUrl);
    return { url };
  }
}
