import { IsEnum, IsOptional } from 'class-validator';
import { JobField, Region } from '@prisma/client';

/** פילטרים ללוח המשרות הציבורי */
export class QueryJobsDto {
  @IsOptional()
  @IsEnum(JobField)
  field?: JobField;

  @IsOptional()
  @IsEnum(Region)
  region?: Region;
}
