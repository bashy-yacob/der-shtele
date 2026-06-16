import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { JobField, Region } from '@prisma/client';

/** טופס הגשת מועמדות מהאתר הציבורי */
export class CreateCandidateDto {
  @IsString()
  @MinLength(2, { message: 'נא להזין שם מלא' })
  fullName!: string;

  // מנרמל מקפים/רווחים לפני הוולידציה (אותו כלל כמו בטפסים בפרונט).
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Matches(/^05\d{8}$/, { message: 'מספר טלפון לא תקין' })
  phone!: string;

  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  email!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsEnum(JobField)
  field!: JobField;

  @IsEnum(Region)
  region!: Region;

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
