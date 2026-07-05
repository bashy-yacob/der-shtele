import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { CreateEmployerDto } from "./dto/create-employer.dto";
import { UpdateEmployerDto } from "./dto/update-employer.dto";
import { CreatePortalUserDto } from "./dto/create-portal-user.dto";
import { QueryEmployersDto } from "./dto/query-employers.dto";
import { pageArgs } from "../../common/pagination/pagination";

/** מעסיקים — פנימי לחלוטין, לעולם לא חשוף לאתר הציבורי. */
@Injectable()
export class EmployersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  /** רשימה מלאה — לבוררי-בחירה (בחירת מעסיק במשרה חדשה). לא לרשימת הניהול הגדולה. */
  findAll() {
    // _count.jobs — מספר המשרות של כל מעסיק, לתצוגה בכרטיס בדשבורד.
    return this.prisma.employer.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { jobs: true } } },
    });
  }

  /**
   * רשימת ניהול המעסיקים עם עימוד/סינון בצד שרת.
   * items = מעסיקים שאינם ממתינים (מסוננים/מחופשים/מעומדים), נדחים בסוף.
   * pending = כל הבקשות הממתינות (מוצגות ככרטיסים נפרדים, תמיד במלואן — מספרן קטן).
   */
  async findAllPaged(query: QueryEmployersDto) {
    const { skip, take, page, pageSize } = pageArgs(query);
    const where: Prisma.EmployerWhereInput = query.status
      ? { status: query.status }
      : { status: { not: "pending" } };
    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { contactPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total, pending] = await this.prisma.$transaction([
      this.prisma.employer.findMany({
        where,
        // סדר enum: approved(1) לפני rejected(2) → נדחים בתחתית. ואז לפי תאריך יורד.
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        include: { _count: { select: { jobs: true } } },
        skip,
        take,
      }),
      this.prisma.employer.count({ where }),
      this.prisma.employer.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { jobs: true } } },
      }),
    ]);
    return { items, total, page, pageSize, pending };
  }

  async findOne(id: string) {
    const employer = await this.prisma.employer.findUnique({
      where: { id },
      include: {
        jobs: true,
        // משתמשי פורטל קיימים — כדי שהצוות יראה אם הופקו פרטי כניסה.
        portalUsers: { select: { id: true, email: true, createdAt: true } },
      },
    });
    if (!employer) throw new NotFoundException("מעסיק לא נמצא");
    return employer;
  }

  /**
   * יצירת משתמש פורטל למעסיק (סעיף 6) — הצוות מפיק פרטי כניסה.
   * המשתמש נוצר עם role=employer, מקושר ל-Employer, ומסומן מאומת (יצירת צוות).
   */
  async createPortalUser(employerId: string, dto: CreatePortalUserDto) {
    const employer = await this.findOne(employerId);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException("כתובת אימייל זו כבר רשומה");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName?.trim() || employer.contactName,
        role: "employer",
        employerId,
        emailVerified: true, // נוצר ע"י הצוות — אין צורך באימות מייל
      },
      select: { id: true, email: true, fullName: true },
    });
    return user;
  }

  create(dto: CreateEmployerDto) {
    // מעסיק שהצוות יוצר ידנית מאושר אוטומטית (default approved בסכימה).
    return this.prisma.employer.create({ data: dto });
  }

  /**
   * אישור בקשת גישה של מעסיק (סעיף 6) — pending → approved. אידמפוטנטי:
   * אישור חוזר לא משנה דבר. שולח מייל למעסיק שהחשבון אושר (fail-soft).
   */
  async approve(id: string) {
    const employer = await this.findOne(id);
    if (employer.status === "approved") return employer;
    const updated = await this.prisma.employer.update({
      where: { id },
      data: { status: "approved", approvedAt: new Date(), rejectionReason: null },
    });
    this.email
      .sendEmployerApproved(employer.contactEmail, employer.contactName)
      .catch(() => undefined);
    return updated;
  }

  /** דחיית בקשת גישה — סטטוס rejected + סיבה אופציונלית; מייל למעסיק (fail-soft). */
  async reject(id: string, reason?: string) {
    const employer = await this.findOne(id);
    const updated = await this.prisma.employer.update({
      where: { id },
      data: { status: "rejected", rejectionReason: reason ?? null },
    });
    this.email
      .sendEmployerRejected(employer.contactEmail, employer.contactName, reason)
      .catch(() => undefined);
    return updated;
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
