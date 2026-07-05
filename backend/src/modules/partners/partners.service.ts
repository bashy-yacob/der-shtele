import { Injectable, NotFoundException } from "@nestjs/common";
import { Partner } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { CreatePartnerDto } from "./dto/create-partner.dto";
import { UpdatePartnerDto } from "./dto/update-partner.dto";

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // מיון אחיד — displayOrder עולה (קטן קודם), ואז החדש ביותר.
  private readonly orderBy = [
    { displayOrder: "asc" as const },
    { createdAt: "desc" as const },
  ];

  /**
   * שותפים פעילים — לאתר הציבורי. שדות ציבוריים בלבד (שם, לוגו, קישור).
   * ה-logoPath מומר ל-URL ציבורי מלא לתצוגה.
   */
  async findPublic() {
    const partners = await this.prisma.partner.findMany({
      where: { isActive: true },
      orderBy: this.orderBy,
    });

    return partners.map((p) => ({
      id: p.id,
      partnerName: p.partnerName,
      linkUrl: p.linkUrl,
      displayOrder: p.displayOrder,
      logoUrl: this.storage.getPartnerLogoUrl(p.logoPath),
    }));
  }

  /** כל השותפים (כולל מוסתרים) — לדשבורד הצוות, עם URL לתצוגה מקדימה. */
  async findAll() {
    const partners = await this.prisma.partner.findMany({
      orderBy: this.orderBy,
    });
    return partners.map((p) => this.withLogoUrl(p));
  }

  async create(dto: CreatePartnerDto) {
    const created = await this.prisma.partner.create({ data: dto });
    return this.withLogoUrl(created);
  }

  async update(id: string, dto: UpdatePartnerDto) {
    await this.ensureExists(id);
    const updated = await this.prisma.partner.update({
      where: { id },
      data: dto,
    });
    return this.withLogoUrl(updated);
  }

  /** מוסיף URL ציבורי מלא לתצוגה מקדימה (הצוות רואה את הלוגו בדשבורד). */
  private withLogoUrl(partner: Partner) {
    return { ...partner, logoUrl: this.storage.getPartnerLogoUrl(partner.logoPath) };
  }

  async remove(id: string) {
    const existing = await this.ensureExists(id);
    // best-effort: מוחקים גם את קובץ הלוגו (לא מפיל את המחיקה).
    if (existing.logoPath) {
      await this.storage
        .deletePartnerLogo(existing.logoPath)
        .catch(() => undefined);
    }
    await this.prisma.partner.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureExists(id: string): Promise<Partner> {
    const found = await this.prisma.partner.findUnique({ where: { id } });
    if (!found) throw new NotFoundException("השותף לא נמצא");
    return found;
  }
}
