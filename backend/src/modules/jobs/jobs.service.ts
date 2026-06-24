import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
import { QueryJobsDto } from "./dto/query-jobs.dto";
import { assertJobTransition } from "../../common/status-machine/status-machine";
import { MailingService } from "../mailing/mailing.service";

// השדות הציבוריים בלבד — לעולם לא חושפים employer / descriptionInternal / salary
const PUBLIC_SELECT = {
  id: true,
  title: true,
  descriptionPublic: true,
  field: true,
  region: true,
  scope: true,
  experience: true, // ניסיון נדרש — גלוי לציבור (שכר נשאר פנימי)
  openedAt: true,
} satisfies Prisma.JobSelect;

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailing: MailingService,
  ) {}

  /** לוח המשרות הציבורי — רק משרות פעילות, שדות ציבוריים בלבד. */
  findPublic(query: QueryJobsDto) {
    return this.prisma.job.findMany({
      where: {
        status: "active",
        ...(query.field && { field: query.field }),
        ...(query.region && { region: query.region }),
        ...(query.experience && { experience: query.experience }),
      },
      select: PUBLIC_SELECT,
      orderBy: { openedAt: "desc" },
    });
  }

  /**
   * רשימת ערים/אזורים קיימים — איחוד ערכי ה-region הייחודיים ממשרות וממועמדים.
   * משמשת להזנת רשימות הבחירה בכל הטפסים, כך שעיר חדשה מופיעה אוטומטית.
   */
  async listRegions(): Promise<string[]> {
    const [jobs, candidates] = await Promise.all([
      this.prisma.job.findMany({
        distinct: ["region"],
        select: { region: true },
      }),
      this.prisma.candidate.findMany({
        distinct: ["region"],
        select: { region: true },
      }),
    ]);
    const set = new Set<string>();
    for (const { region } of [...jobs, ...candidates]) {
      const value = region?.trim();
      if (value) set.add(value);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "he"));
  }

  /** משרה ציבורית בודדת. */
  async findPublicOne(id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, status: "active" },
      select: PUBLIC_SELECT,
    });
    if (!job) throw new NotFoundException("משרה לא נמצאה");
    return job;
  }

  // ---- פנימי (צוות) ----

  findAll() {
    return this.prisma.job.findMany({
      include: { employer: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        employer: true,
        presentations: {
          orderBy: { presentedAt: "desc" },
          include: {
            candidate: {
              select: { id: true, fullName: true, phone: true, status: true },
            },
          },
        },
      },
    });
    if (!job) throw new NotFoundException("משרה לא נמצאה");
    return job;
  }

  async create(dto: CreateJobDto) {
    const job = await this.prisma.job.create({ data: dto });
    // דיוור "משרה חדשה רלוונטית" למנויים מתאימים — רק למשרה פעילה.
    // fire-and-forget: כשל בדיוור לא מפיל את יצירת המשרה.
    if (job.status === "active") {
      this.mailing
        .notifyNewJob(job)
        .catch((err) => this.logger.error("כשל בדיוור משרה חדשה", err));
    }
    return job;
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
        ...(dto.status === "closed" || dto.status === "filled"
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
