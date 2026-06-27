import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { AdPlacement, AdStatus, AdPaymentStatus } from "@prisma/client";

const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

/** יצירת מודעת חסות — צוות בלבד. פרטי המפרסם פנימיים. */
export class CreateAdvertisementDto {
  // --- מפרסם (פנימי) ---
  @IsString()
  @MinLength(2, { message: "שם המפרסם חייב להיות לפחות 2 תווים" })
  @MaxLength(80, { message: "שם המפרסם ארוך מדי" })
  advertiserName!: string;

  @IsString()
  @MinLength(2, { message: "טלפון לא תקין" })
  @MaxLength(40)
  contactPhone!: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEmail({}, { message: "כתובת מייל לא תקינה" })
  contactEmail?: string;

  // --- תוכן ---
  @IsString()
  @MinLength(2, { message: "כותרת חייבת להיות לפחות 2 תווים" })
  @MaxLength(80, { message: "כותרת ארוכה מדי" })
  title!: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(300, { message: "הטקסט ארוך מדי" })
  body?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(500)
  imagePath?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(500)
  linkUrl?: string;

  // --- מיקום ותצוגה ---
  @IsEnum(AdPlacement)
  placement!: AdPlacement;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  // --- מחזור חיים + תשלום (שער prepaid נאכף בשירות) ---
  @IsOptional()
  @IsEnum(AdStatus)
  status?: AdStatus;

  @IsOptional()
  @IsEnum(AdPaymentStatus)
  paymentStatus?: AdPaymentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  agreedPrice?: number;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  endDate?: string;
}
