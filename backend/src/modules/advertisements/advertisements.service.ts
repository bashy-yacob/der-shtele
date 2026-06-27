import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AdPlacement, Advertisement, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { CreateAdvertisementDto } from "./dto/create-advertisement.dto";
import { UpdateAdvertisementDto } from "./dto/update-advertisement.dto";
import { isAdLive, canActivateAd } from "../../common/ads/ads";

@Injectable()
export class AdvertisementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // מיון אחיד — order עולה (קטן קודם), ואז החדש ביותר.
  private readonly orderBy = [
    { order: "asc" as const },
    { createdAt: "desc" as const },
  ];

  /**
   * מודעות חיות למיקום נתון — לאתר הציבורי. שדות ציבוריים בלבד (ללא פרטי
   * מפרסם/מחיר/תשלום). חלון התאריכים נאכף ב-isAdLive.
   */
  async findPublic(placement: AdPlacement) {
    // placement לא תקין → רשימה ריקה (במקום 500 מ-Prisma על enum לא חוקי).
    if (!Object.values(AdPlacement).includes(placement)) return [];

    const ads = await this.prisma.advertisement.findMany({
      where: { placement, status: "active", paymentStatus: "paid" },
      orderBy: this.orderBy,
    });

    const now = new Date();
    return ads
      .filter((ad) => isAdLive(ad, now))
      .map((ad) => ({
        id: ad.id,
        title: ad.title,
        body: ad.body,
        linkUrl: ad.linkUrl,
        placement: ad.placement,
        order: ad.order,
        imageUrl: ad.imagePath
          ? this.storage.getAdImageUrl(ad.imagePath)
          : null,
      }));
  }

  /** כל המודעות (כולל שדות פנימיים) — לדשבורד הצוות. */
  findAll() {
    return this.prisma.advertisement.findMany({ orderBy: this.orderBy });
  }

  create(dto: CreateAdvertisementDto) {
    const status = dto.status ?? "draft";
    const paymentStatus = dto.paymentStatus ?? "unpaid";
    if (status === "active" && !canActivateAd(paymentStatus)) {
      throw new BadRequestException("לא ניתן להפעיל מודעה לפני קבלת תשלום");
    }
    return this.prisma.advertisement.create({
      data: {
        ...dto,
        startDate: this.toDate(dto.startDate),
        endDate: this.toDate(dto.endDate),
        ...(paymentStatus === "paid" ? { paidAt: new Date() } : {}),
      },
    });
  }

  async update(id: string, dto: UpdateAdvertisementDto) {
    const existing = await this.ensureExists(id);

    // שער prepaid — בודק את המצב המשולב הצפוי לאחר העדכון.
    const nextStatus = dto.status ?? existing.status;
    const nextPayment = dto.paymentStatus ?? existing.paymentStatus;
    if (nextStatus === "active" && !canActivateAd(nextPayment)) {
      throw new BadRequestException("לא ניתן להפעיל מודעה לפני קבלת תשלום");
    }

    const data: Prisma.AdvertisementUpdateInput = {
      ...dto,
      ...(dto.startDate !== undefined
        ? { startDate: this.toDate(dto.startDate) }
        : {}),
      ...(dto.endDate !== undefined
        ? { endDate: this.toDate(dto.endDate) }
        : {}),
      // חותמת תשלום — נרשמת פעם אחת, ברגע המעבר ל-paid.
      ...(dto.paymentStatus === "paid" && existing.paymentStatus !== "paid"
        ? { paidAt: new Date() }
        : {}),
    };

    return this.prisma.advertisement.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.ensureExists(id);
    // best-effort: מוחקים גם את קובץ התמונה אם קיים (לא מפיל את המחיקה).
    if (existing.imagePath) {
      await this.storage
        .deleteAdImage(existing.imagePath)
        .catch(() => undefined);
    }
    await this.prisma.advertisement.delete({ where: { id } });
    return { ok: true };
  }

  private toDate(value?: string | null): Date | null {
    return value ? new Date(value) : null;
  }

  private async ensureExists(id: string): Promise<Advertisement> {
    const found = await this.prisma.advertisement.findUnique({ where: { id } });
    if (!found) throw new NotFoundException("המודעה לא נמצאה");
    return found;
  }
}
