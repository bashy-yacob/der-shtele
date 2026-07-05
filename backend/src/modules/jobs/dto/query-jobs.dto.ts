import { IsEnum, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { JobField } from "@prisma/client";

/**
 * מפצל ערך query רב-בחירה לרשימה מנוקה. תומך גם ב-`field=a,b,c`
 * (פסיקים) וגם במופעים חוזרים (`field=a&field=b`). ריק → undefined כדי
 * ש-@IsOptional ידלג על הוולידציה.
 */
function toStringArray(value: unknown): string[] | undefined {
  const raw = Array.isArray(value) ? value : [value];
  const items = raw
    .flatMap((v) => (typeof v === "string" ? v.split(",") : []))
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

/** פילטרים ללוח המשרות הציבורי — תחום ואזור תומכים ברב-בחירה. */
export class QueryJobsDto {
  // רב-בחירה: `field=logistics,sales` → נבדק שכל ערך הוא JobField חוקי.
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsEnum(JobField, { each: true })
  field?: JobField[];

  // רב-בחירה: `region=בני ברק,ירושלים` — ערים/אזורים כטקסט חופשי.
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsString({ each: true })
  region?: string[];

  @IsOptional()
  @IsString()
  experience?: string; // ניסיון נדרש — בחירה יחידה, סינון לפי הערך המדויק
}
