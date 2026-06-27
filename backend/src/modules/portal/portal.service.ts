import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { assertJobTransition } from "../../common/status-machine/status-machine";
import { escapeHtml } from "../../common/util/escape-html";
import { CreatePortalJobDto } from "./dto/create-portal-job.dto";
import { UpdatePortalJobDto } from "./dto/update-portal-job.dto";

/**
 * פורטל המעסיקים (סעיף 6). כל פעולה מתוחמת ל-employerId שמגיע מהטוקן —
 * מעסיק רואה ופועל רק על המשרות/הגיוסים שלו.
 *
 * כלל ברזל: מעסיק לא רואה פרטי קשר של מועמד. מועמדים שהוצגו מוצגים בשם
 * מקוצר (שם פרטי + ראשי תיבות) + סטטוס בלבד — בלי טלפון/מייל/קו"ח.
 */
@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  private requireEmployer(employerId: string | null): string {
    if (!employerId) {
      throw new ForbiddenException("המשתמש אינו משויך למעסיק");
    }
    return employerId;
  }

  /**
   * כמו requireEmployer, אך גם מוודא שהמעסיק אושר ע"י הצוות (סעיף 6).
   * מעסיק pending/rejected חסום מפרסום משרות וצפייה במועמדים — שכבת הגנה
   * בצד השרת, גם אם הפרונט מציג בטעות. getMe/sendMessage נשארים פתוחים.
   */
  private async requireApprovedEmployer(
    employerId: string | null,
  ): Promise<string> {
    const id = this.requireEmployer(employerId);
    const employer = await this.prisma.employer.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!employer) throw new NotFoundException("מעסיק לא נמצא");
    if (employer.status !== "approved") {
      throw new ForbiddenException("החשבון ממתין לאישור הצוות");
    }
    return id;
  }

  /** שם מקוצר לשמירת פרטיות: "יוסי כהן" → "יוסי כ.". */
  private shortName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  }

  /** פרטי המעסיק להצגת כותרת הפורטל + סטטוס אישור (מניע את מסך ההמתנה). */
  async getMe(employerId: string | null) {
    const id = this.requireEmployer(employerId);
    const employer = await this.prisma.employer.findUnique({
      where: { id },
      select: { id: true, companyName: true, contactName: true, status: true },
    });
    if (!employer) throw new NotFoundException("מעסיק לא נמצא");
    return employer;
  }

  /** המשרות של המעסיק — כל הסטטוסים, עם ספירת מועמדים שהוצגו. */
  async listJobs(employerId: string | null) {
    const id = this.requireEmployer(employerId);
    return this.prisma.job.findMany({
      where: { employerId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        field: true,
        region: true,
        scope: true,
        experience: true,
        status: true,
        openedAt: true,
        createdAt: true,
        _count: { select: { presentations: true } },
      },
    });
  }

  /** משרה בודדת של המעסיק + מועמדים שהוצגו (בשם מקוצר + סטטוס, ללא פרטי קשר). */
  async getJob(employerId: string | null, jobId: string) {
    const id = await this.requireApprovedEmployer(employerId);
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, employerId: id },
      select: {
        id: true,
        title: true,
        field: true,
        region: true,
        scope: true,
        experience: true,
        salary: true,
        status: true,
        openedAt: true,
        descriptionPublic: true,
        descriptionInternal: true,
        presentations: {
          orderBy: { presentedAt: "desc" },
          select: {
            id: true,
            presentedAt: true,
            status: true,
            candidate: { select: { fullName: true } },
          },
        },
      },
    });
    if (!job) throw new NotFoundException("משרה לא נמצאה");

    const { presentations, ...rest } = job;
    return {
      ...rest,
      // ⚠️ ללא טלפון/מייל/קו"ח — רק שם מקוצר + סטטוס (מודל התיווך).
      presentations: presentations.map((p) => ({
        id: p.id,
        presentedAt: p.presentedAt,
        status: p.status,
        candidateLabel: this.shortName(p.candidate.fullName),
      })),
    };
  }

  /** פרסום משרה חדשה — נכפה ל-pending עד אישור הצוות. */
  async createJob(employerId: string | null, dto: CreatePortalJobDto) {
    const id = await this.requireApprovedEmployer(employerId);
    return this.prisma.job.create({
      data: { ...dto, employerId: id, status: "pending" },
      select: { id: true, title: true, status: true },
    });
  }

  /** עריכת משרה של המעסיק. שינוי סטטוס מוגבל — אסור לאשר משרה ממתינה. */
  async updateJob(
    employerId: string | null,
    jobId: string,
    dto: UpdatePortalJobDto,
  ) {
    const id = await this.requireApprovedEmployer(employerId);
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, employerId: id },
    });
    if (!job) throw new NotFoundException("משרה לא נמצאה");

    if (dto.status && dto.status !== job.status) {
      assertJobTransition(job.status, dto.status);
      // אישור משרה (pending→active) הוא תפקיד הצוות בלבד.
      if (job.status === "pending" && dto.status === "active") {
        throw new ForbiddenException('אישור משרה מתבצע ע"י הצוות בלבד');
      }
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        ...dto,
        ...(dto.status === "closed" ? { closedAt: new Date() } : {}),
      },
      select: { id: true, title: true, status: true },
    });
  }

  /** עמלות/חשבוניות של המעסיק (קריאה בלבד) — ללא פרטי מועמד. */
  async listPlacements(employerId: string | null) {
    const id = await this.requireApprovedEmployer(employerId);
    return this.prisma.placement.findMany({
      where: { employerId: id, commissionAmount: { not: null } },
      orderBy: { placedAt: "desc" },
      select: {
        id: true,
        placedAt: true,
        guaranteeEndsAt: true,
        status: true,
        commissionAmount: true,
        commissionStatus: true,
        job: { select: { title: true } },
      },
    });
  }

  /** תקשורת עם הצוות — נשמרת כפנייה ומתריעה לצוות. */
  async sendMessage(employerId: string | null, message: string) {
    const id = this.requireEmployer(employerId);
    const employer = await this.prisma.employer.findUnique({
      where: { id },
      select: { companyName: true, contactName: true, contactPhone: true },
    });
    if (!employer) throw new NotFoundException("מעסיק לא נמצא");

    await this.prisma.contact.create({
      data: {
        name: employer.contactName,
        phone: employer.contactPhone,
        inquiry_type: "employer",
        message,
        companyName: employer.companyName,
      },
    });
    await this.email.notifyTeam(
      `הודעה מפורטל מעסיק — ${employer.companyName}`,
      `<div dir="rtl"><p><b>${escapeHtml(employer.companyName)}</b> (${escapeHtml(employer.contactName)}):</p><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p></div>`,
    );
    return { ok: true };
  }
}
