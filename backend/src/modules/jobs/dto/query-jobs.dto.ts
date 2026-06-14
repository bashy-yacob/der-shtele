import { IsEnum, IsOptional } from 'class-validator';
import { Gender, JobField, Region } from '@prisma/client';

/** פילטרים ללוח המשרות הציבורי */
export class QueryJobsDto {
  @IsOptional()
  @IsEnum(JobField)
  field?: JobField;

  @IsOptional()
  @IsEnum(Region)
  region?: Region;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
