import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender, JobField, Region } from '@prisma/client';

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

  @IsEnum(Region)
  region!: Region;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  scope!: string; // 'מלאה' | 'חלקית' | 'גמיש'

  @IsOptional()
  @IsBoolean()
  rabbinicalApproval?: boolean;

  @IsOptional()
  @IsString()
  rabbinicalApprovalBy?: string;
}
