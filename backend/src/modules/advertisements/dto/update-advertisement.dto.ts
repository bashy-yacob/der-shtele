import { PartialType } from "@nestjs/mapped-types";
import { CreateAdvertisementDto } from "./create-advertisement.dto";

/** עדכון מודעה — כל השדות אופציונליים (כולל status/paymentStatus לניהול). */
export class UpdateAdvertisementDto extends PartialType(
  CreateAdvertisementDto,
) {}
