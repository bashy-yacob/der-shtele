import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { CreateContactDto, InquiryType } from "./dto/create-contact.dto";
import { QueryContactsDto } from "./dto/query-contacts.dto";
import { pageArgs } from "../../common/pagination/pagination";
import { escapeHtml } from "../../common/util/escape-html";

// תוויות עברית לתחום — מקור אמת לתצוגת המייל לצוות.
const FIELD_LABELS: Record<string, string> = {
  logistics: "לוגיסטיקה",
  admin: "אדמיניסטרציה",
  sales: "מכירות",
  education: "חינוך",
  tech: "מחשבים",
  finance: "כספים",
  healthcare: "בריאות",
  other: "אחר",
};

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  /** פנייה מטופס "צור קשר" / פניית מעסיק. resumePath אופציונלי (הועלה מראש). */
  async create(dto: CreateContactDto, resumePath: string | null) {
    await this.prisma.contact.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        inquiry_type: dto.inquiry_type,
        message: dto.message,
        resumePath,
        // הסכמת דיוור (חוק הספאם) — תאריך נשמר רק אם הוסכם.
        optInMarketing: dto.optInMarketing ?? false,
        optInAt: dto.optInMarketing ? new Date() : null,
        // פרטים מובְנים — נשמרים גם כשהם undefined (Prisma מתעלם), כך שפניות
        // מועמד/כללי לא נפגעות, ופניית מעסיק נשמרת מלאה ומובְנת.
        email: dto.email,
        companyName: dto.companyName,
        businessNumber: dto.businessNumber,
        companyLocation: dto.companyLocation,
        jobTitle: dto.jobTitle,
        field: dto.field,
        region: dto.region,
        scope: dto.scope,
        experience: dto.experience,
        salary: dto.salary,
      },
    });

    await this.email.notifyTeam(
      dto.inquiry_type === InquiryType.employer
        ? `פניית מעסיק חדשה${dto.companyName ? ` — ${dto.companyName}` : ""}`
        : "פנייה חדשה מהאתר",
      this.buildTeamEmail(dto, resumePath),
    );

    return { ok: true };
  }

  /** מרכיב את גוף המייל לצוות — מובְנה ומפורט לפניית מעסיק, פשוט לשאר. */
  private buildTeamEmail(
    dto: CreateContactDto,
    resumePath: string | null,
  ): string {
    if (dto.inquiry_type !== InquiryType.employer) {
      return `<div dir="rtl">
        <p><b>${escapeHtml(dto.name)}</b> (${escapeHtml(dto.phone)}) — ${escapeHtml(dto.inquiry_type)}</p>
        <p>${escapeHtml(dto.message).replace(/\n/g, "<br/>")}</p>
        ${resumePath ? "<p>צורפו קורות חיים.</p>" : ""}
      </div>`;
    }

    // שורת פרטים — מודפסת רק אם יש ערך.
    const row = (label: string, value?: string | null) =>
      value
        ? `<tr><td style="padding:2px 10px 2px 0;color:#6b7280">${label}</td><td style="padding:2px 0"><b>${escapeHtml(value)}</b></td></tr>`
        : "";

    const fieldLabel = dto.field ? (FIELD_LABELS[dto.field] ?? dto.field) : "";

    return `<div dir="rtl" style="font-family:Arial,sans-serif">
      <h3 style="margin:0 0 8px">פניית מעסיק חדשה</h3>
      <p style="margin:0 0 4px;color:#6b7280">פרטי החברה ואיש הקשר (פנימי בלבד):</p>
      <table style="border-collapse:collapse;margin-bottom:12px">
        ${row("שם החברה", dto.companyName)}
        ${row("ח.פ / עוסק", dto.businessNumber)}
        ${row("מיקום החברה", dto.companyLocation)}
        ${row("איש קשר", dto.name)}
        ${row("טלפון", dto.phone)}
        ${row("מייל", dto.email)}
      </table>
      <p style="margin:0 0 4px;color:#6b7280">פרטי המשרה:</p>
      <table style="border-collapse:collapse;margin-bottom:12px">
        ${row("תפקיד", dto.jobTitle)}
        ${row("תחום", fieldLabel)}
        ${row("אזור", dto.region)}
        ${row("היקף", dto.scope)}
        ${row("ניסיון נדרש", dto.experience)}
        ${row("טווח שכר מוצע", dto.salary)}
      </table>
      <p style="margin:0 0 4px;color:#6b7280">תיאור המשרה והדרישות:</p>
      <p style="margin:0">${escapeHtml(dto.message).replace(/\n/g, "<br/>")}</p>
      ${resumePath ? "<p>צורפו קורות חיים.</p>" : ""}
    </div>`;
  }

  findAll() {
    return this.prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
  }

  /**
   * רשימת הפניות עם עימוד/סינון בצד שרת.
   * openCount = כמה פניות טרם טופלו (בכל המערכת, ללא תלות בסינון) — לתג בכותרת.
   */
  async findAllPaged(query: QueryContactsDto) {
    const { skip, take, page, pageSize } = pageArgs(query);
    const where: Prisma.ContactWhereInput = {};
    if (query.type) where.inquiry_type = query.type;
    if (query.handled === "open") where.handledAt = null;
    if (query.handled === "handled") where.handledAt = { not: null };
    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total, openCount] = await this.prisma.$transaction([
      this.prisma.contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.contact.count({ where }),
      this.prisma.contact.count({ where: { handledAt: null } }),
    ]);
    return { items, total, page, pageSize, openCount };
  }

  /** סימון פנייה כטופלה (חותמת זמן) או ביטול הסימון. מחזיר את הפנייה המעודכנת. */
  setHandled(id: string, handled: boolean) {
    return this.prisma.contact.update({
      where: { id },
      data: { handledAt: handled ? new Date() : null },
    });
  }

  /** נתיב הקו"ח שצורף לפנייה — לחתימת URL בבקר (צוות בלבד). */
  async getResumePath(id: string): Promise<string> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      select: { resumePath: true },
    });
    if (!contact?.resumePath)
      throw new NotFoundException("אין קורות חיים לפנייה זו");
    return contact.resumePath;
  }
}
