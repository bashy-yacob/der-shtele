import { PartialType } from "@nestjs/mapped-types";
import { CreatePartnerDto } from "./create-partner.dto";

/** עדכון שותף — כל השדות אופציונליים (כולל isActive/displayOrder לניהול). */
export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {}
