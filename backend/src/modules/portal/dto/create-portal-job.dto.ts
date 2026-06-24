import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { JobField } from "@prisma/client";

/** פרסום משרה דרך פורטל המעסיק. employerId נגזר מהטוקן; הסטטוס נכפה ל-pending. */
export class CreatePortalJobDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(10)
  descriptionPublic!: string; // התיאור האנונימי שעולה לאתר

  @IsString()
  descriptionInternal!: string; // דרישות מלאות — פנימי

  @IsEnum(JobField)
  field!: JobField;

  @IsString()
  @MinLength(1)
  region!: string;

  @IsString()
  scope!: string; // 'מלאה' | 'חלקית' | 'גמיש'

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  salary?: string; // פנימי בלבד
}
