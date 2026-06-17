import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { JobField } from "@prisma/client";

/**
 * עדכון פרטי המשתמש המחובר — עדכון חלקי (כל השדות אופציונליים).
 * משמש גם להעדפת דיוור (opt-in/opt-out) וגם לפרטי הפרופיל לדיוור מותאם.
 * שדה שלא נשלח אינו משתנה; שליחת null מנקה את השדה.
 */
export class UpdateMeDto {
  @IsOptional()
  @IsBoolean()
  optInMarketing?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  // עיר/אזור מגורים — מפלח את הדיוור לפי אזור
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string | null;

  // תחום תעסוקה מבוקש — מפלח את הדיוור לפי תחום
  @IsOptional()
  @IsEnum(JobField)
  preferredField?: JobField | null;

  // שנות ניסיון — לסינון פנימי של הצוות (הפרונט שולח מספר או null, לא מחרוזת)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  yearsExperience?: number | null;
}
