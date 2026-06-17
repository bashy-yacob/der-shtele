import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CandidateStatus, JobField, Region } from '@prisma/client';

/** סינון נמענים לפי שדות המועמד המקושר (אופציונלי). */
export class MailingFilterDto {
  @IsOptional()
  @IsEnum(JobField)
  field?: JobField;

  @IsOptional()
  @IsEnum(Region)
  region?: Region;

  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;
}

/** שליחה ידנית של תוכן לרשימת התפוצה (סעיף 8.3). */
export class SendMailingDto {
  @IsString()
  @MinLength(2)
  subject!: string;

  @IsString()
  @MinLength(1)
  body!: string; // טקסט חופשי — נעטף בתבנית RTL, escapeHtml בצד השרת

  @IsOptional()
  @ValidateNested()
  @Type(() => MailingFilterDto)
  filter?: MailingFilterDto;
}
