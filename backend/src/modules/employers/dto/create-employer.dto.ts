import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateEmployerDto {
  @IsString()
  @MinLength(2)
  companyName!: string;

  @IsOptional()
  @IsString()
  businessNumber?: string; // ח.פ

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  contactName!: string;

  @IsString()
  contactPhone!: string;

  @IsEmail({}, { message: "כתובת אימייל לא תקינה" })
  contactEmail!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
