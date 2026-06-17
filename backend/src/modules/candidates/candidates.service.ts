import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { StorageService } from "../../common/storage/storage.service";
import { CreateCandidateDto } from "./dto/create-candidate.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";
import { CreateCallLogDto } from "./dto/create-call-log.dto";
import { assertCandidateTransition } from "../../common/status-machine/status-machine";
import { escapeHtml } from "../../common/util/escape-html";

@Injectable()
export class CandidatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly storage: StorageService,
  ) {}

  /**
   * הגשת מועמדות מהאתר — מקשר את ההגשה למשתמש המחובר.
   * משתמש שמגיש בפעם הראשונה: נוצרת רשומת Candidate ונקשרת ל-User (User.candidateId).
   * הגשות נוספות: אותו מועמד מתעדכן (פרטים + קו"ח) ונוספת לו הצגה למשרה.
   * כך "ההגשות שלי" באזור האישי שולף לפי המשתמש, ולא נוצר מועמד כפול בכל הגשה.
   */
  async createFromApplication(dto: CreateCandidateDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("משתמש לא נמצא");

    const data = {
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      city: dto.city ?? "",
      field: dto.field,
      region: dto.region,
      notes: dto.notes,
      ...(dto.cvPath ? { cvUrl: dto.cvPath, cvUploadedAt: new Date() } : {}),
    };

    let candidateId = user.candidateId;
    if (candidateId) {
      // מועמד קיים — מעדכן פרטים/קו"ח מההגשה הנוכחית
      await this.prisma.candidate.update({ where: { id: candidateId }, data });
    } else {
      // הגשה ראשונה — יוצר מועמד וקושר אותו למשתמש
      const candidate = await this.prisma.candidate.create({ data });
      candidateId = candidate.id;
      await this.prisma.user.update({
        where: { id: userId },
        data: { candidateId },
      });
    }

    // אם הוגש על משרה ספציפית — יוצר הצגה (אם כבר הוצג למשרה זו, מתעלמים בשקט)
    if (dto.jobId) {
      await this.prisma.jobPresentation
        .create({ data: { jobId: dto.jobId, candidateId } })
        .catch(() => undefined);
    }

    await this.email.notifyTeam(
      "מועמד חדש",
      `<div dir="rtl">מועמד חדש: <b>${escapeHtml(dto.fullName)}</b> (${escapeHtml(dto.phone)}, ${escapeHtml(dto.email)})</div>`,
    );
    await this.email.sendCandidateConfirmation(dto.email, dto.fullName);

    return { id: candidateId };
  }

  /** ההגשות של המשתמש המחובר — משרות שהגיש אליהן + סטטוס כל אחת (לאזור האישי). */
  async getMyApplications(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.candidateId) return [];

    const presentations = await this.prisma.jobPresentation.findMany({
      where: { candidateId: user.candidateId },
      orderBy: { presentedAt: "desc" },
      select: {
        id: true,
        presentedAt: true,
        status: true,
        job: {
          select: {
            id: true,
            title: true,
            field: true,
            region: true,
            scope: true,
            status: true,
          },
        },
      },
    });
    return presentations;
  }

  // ---- CRM (צוות) ----

  findAll() {
    return this.prisma.candidate.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // המשרות שהמועמד הוגש אליהן — כדי שהצוות יראה ברשימה לאיזו משרה הגיע
        presentations: {
          orderBy: { presentedAt: "desc" },
          select: {
            jobId: true,
            job: { select: { id: true, title: true } },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        callLogs: { orderBy: { calledAt: "desc" } },
        presentations: {
          orderBy: { presentedAt: "desc" },
          include: { job: { select: { id: true, title: true } } },
        },
        placements: {
          orderBy: { placedAt: "desc" },
          include: {
            job: { select: { id: true, title: true } },
            employer: { select: { id: true, companyName: true } },
          },
        },
      },
    });
    if (!candidate) throw new NotFoundException("מועמד לא נמצא");
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
    if (!candidate) throw new NotFoundException("מועמד לא נמצא");
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
    if (!candidate.cvUrl)
      throw new NotFoundException("אין קורות חיים למועמד זה");
    const url = await this.storage.getSignedUrl(candidate.cvUrl);
    return { url };
  }
}
