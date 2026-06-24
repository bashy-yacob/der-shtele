import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { JobField } from "@prisma/client";

export enum InquiryType {
  candidate = "candidate",
  employer = "employer",
  general = "general",
}

// ממיר '' → undefined כך ש-@IsOptional ידלג על שדות ריקים שהטופס שולח כ-FormData.
const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export class CreateContactDto {
  @IsString()
  @MinLength(2, { message: "שם חייב להיות לפחות 2 תווים" })
  name!: string;

  // מנרמל מקפים/רווחים לפני הוולידציה — תואם את ה-placeholder עם מקפים בטופס.
  @Transform(({ value }) =>
    typeof value === "string" ? value.replace(/\D/g, "") : value,
  )
  @Matches(/^05\d{8}$/, { message: "מספר טלפון לא תקין" })
  phone!: string;

  @IsEnum(InquiryType, { message: "נא לבחור סוג פנייה" })
  inquiry_type!: InquiryType;

  @IsString()
  @MinLength(10, { message: "ההודעה חייבת להיות לפחות 10 תווים" })
  message!: string;

  // ——— פרטים מובְנים מפניית מעסיק (אופציונליים לכל סוגי הפניות) ———
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEmail({}, { message: "כתובת אימייל לא תקינה" })
  email?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  companyName?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  businessNumber?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  companyLocation?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(JobField, { message: "תחום לא תקין" })
  field?: JobField;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  region?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  scope?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  experience?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  salary?: string;

  // הסכמה לקבלת עדכונים/תוכן שיווקי (חוק הספאם). מגיע כמחרוזת מ-FormData.
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  optInMarketing?: boolean;
}
