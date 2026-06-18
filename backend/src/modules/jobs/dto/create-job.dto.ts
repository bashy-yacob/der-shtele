import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { JobField } from "@prisma/client";

export class CreateJobDto {
  @IsString()
  employerId!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(10)
  descriptionPublic!: string;

  @IsString()
  descriptionInternal!: string;

  @IsEnum(JobField)
  field!: JobField;

  @IsString()
  @MinLength(1)
  region!: string; // עיר/אזור — טקסט חופשי

  @IsString()
  scope!: string; // 'מלאה' | 'חלקית' | 'גמיש'

  @IsOptional()
  @IsString()
  experience?: string; // ניסיון נדרש — גלוי לציבור

  @IsOptional()
  @IsString()
  salary?: string; // שכר מוצע — פנימי בלבד
}
