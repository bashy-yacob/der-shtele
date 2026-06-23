import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  // מיון אחיד — order עולה (קטן קודם), ואז החדש ביותר.
  private readonly orderBy = [
    { order: "asc" as const },
    { createdAt: "desc" as const },
  ];

  /** המלצות מפורסמות בלבד — לאתר הציבורי. */
  findPublished() {
    return this.prisma.testimonial.findMany({
      where: { published: true },
      orderBy: this.orderBy,
      select: { id: true, authorName: true, authorRole: true, quote: true },
    });
  }

  /** כל ההמלצות (כולל לא-מפורסמות) — לדשבורד הצוות. */
  findAll() {
    return this.prisma.testimonial.findMany({ orderBy: this.orderBy });
  }

  create(dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({ data: dto });
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    await this.ensureExists(id);
    return this.prisma.testimonial.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.testimonial.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!found) throw new NotFoundException("ההמלצה לא נמצאה");
  }
}
