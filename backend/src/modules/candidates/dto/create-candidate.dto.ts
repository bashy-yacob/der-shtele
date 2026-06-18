import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { JobField } from "@prisma/client";

const CURRENT_YEAR = new Date().getFullYear();

/** טופס הגשת מועמדות מהאתר הציבורי */
export class CreateCandidateDto {
  @IsString()
  @MinLength(2, { message: "נא להזין שם מלא" })
  fullName!: string;

  // מנרמל מקפים/רווחים לפני הוולידציה (אותו כלל כמו בטפסים בפרונט).
  @Transform(({ value }) =>
    typeof value === "string" ? value.replace(/\D/g, "") : value,
  )
  @Matches(/^05\d{8}$/, { message: "מספר טלפון לא תקין" })
  phone!: string;

  @IsEmail({}, { message: "כתובת אימייל לא תקינה" })
  email!: string;

  @IsOptional()
  @IsString()
  city?: string;

  // בהגשה למשרה ספציפית תחום/אזור נגזרים מהמשרה בצד שרת — לכן אופציונליים בטופס.
  @IsOptional()
  @IsEnum(JobField)
  field?: JobField;

  @IsOptional()
  @IsString()
  @MinLength(1)
  region?: string; // עיר/אזור — טקסט חופשי

  // שנת לידה (אופציונלי)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1920, { message: "שנת לידה לא תקינה" })
  @Max(CURRENT_YEAR, { message: "שנת לידה לא תקינה" })
  birthYear?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  // אם הוגש על משרה ספציפית
  @IsOptional()
  @IsString()
  jobId?: string;

  // נתיב קו"ח ב-Supabase (לאחר העלאה דרך /candidates/resume)
  @IsOptional()
  @IsString()
  cvPath?: string;
}
