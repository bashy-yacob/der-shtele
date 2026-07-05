import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, Type } from "class-transformer";

const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

/** יצירת שותף — צוות בלבד. לוגו בלבד (ללא תמונות אנשים). */
export class CreatePartnerDto {
  @IsString()
  @MinLength(2, { message: "שם השותף חייב להיות לפחות 2 תווים" })
  @MaxLength(80, { message: "שם השותף ארוך מדי" })
  partnerName!: string;

  // נתיב הלוגו ב-bucket — מוחזר מהעלאת הקובץ (POST /partners/logo).
  @IsString()
  @MinLength(1, { message: "יש להעלות לוגו" })
  @MaxLength(500)
  logoPath!: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(500)
  linkUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
