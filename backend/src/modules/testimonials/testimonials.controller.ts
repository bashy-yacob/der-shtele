import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { TestimonialsService } from "./testimonials.service";
import { CreateTestimonialDto } from "./dto/create-testimonial.dto";
import { UpdateTestimonialDto } from "./dto/update-testimonial.dto";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";

@Controller("testimonials")
export class TestimonialsController {
  constructor(private readonly testimonials: TestimonialsService) {}

  // ---- ציבורי ----

  /** המלצות מפורסמות — לדף הבית. */
  @Public()
  @Get()
  findPublished() {
    return this.testimonials.findPublished();
  }

  // ---- פנימי (צוות) ----

  @Get("admin/all")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  findAll() {
    return this.testimonials.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  create(@Body() dto: CreateTestimonialDto) {
    return this.testimonials.create(dto);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  update(@Param("id") id: string, @Body() dto: UpdateTestimonialDto) {
    return this.testimonials.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("staff", "admin")
  remove(@Param("id") id: string) {
    return this.testimonials.remove(id);
  }
}
