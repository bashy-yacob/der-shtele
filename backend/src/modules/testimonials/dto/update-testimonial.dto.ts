import { PartialType } from "@nestjs/mapped-types";
import { CreateTestimonialDto } from "./create-testimonial.dto";

/** עדכון המלצה — כל השדות אופציונליים (כולל published ו-order לניהול תצוגה). */
export class UpdateTestimonialDto extends PartialType(CreateTestimonialDto) {}
