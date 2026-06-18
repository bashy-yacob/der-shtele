import { IsEnum, IsOptional, IsString } from "class-validator";
import { JobField } from "@prisma/client";

/** פילטרים ללוח המשרות הציבורי */
export class QueryJobsDto {
  @IsOptional()
  @IsEnum(JobField)
  field?: JobField;

  @IsOptional()
  @IsString()
  region?: string; // עיר/אזור — טקסט חופשי

  @IsOptional()
  @IsString()
  experience?: string; // ניסיון נדרש — סינון לפי הערך המדויק
}
