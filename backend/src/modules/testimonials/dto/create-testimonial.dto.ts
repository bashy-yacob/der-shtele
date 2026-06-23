import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";

const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

/** יצירת המלצה — צוות בלבד. */
export class CreateTestimonialDto {
  @IsString()
  @MinLength(2, { message: "שם חייב להיות לפחות 2 תווים" })
  @MaxLength(60, { message: "שם ארוך מדי" })
  authorName!: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(120, { message: "התיאור ארוך מדי" })
  authorRole?: string;

  @IsString()
  @MinLength(10, { message: "ההמלצה חייבת להיות לפחות 10 תווים" })
  @MaxLength(600, { message: "ההמלצה ארוכה מדי" })
  quote!: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}
