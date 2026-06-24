import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsOptional } from "class-validator";
import { JobStatus } from "@prisma/client";
import { CreatePortalJobDto } from "./create-portal-job.dto";

/** עריכת משרה ע"י המעסיק — כל השדות אופציונליים + שינוי סטטוס מוגבל. */
export class UpdatePortalJobDto extends PartialType(CreatePortalJobDto) {
  // המעסיק יכול להשהות/לפתוח/לסגור משרה — אך לא לאשר משרה ממתינה (זה הצוות).
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
