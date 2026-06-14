import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

/** רישום גיוס מוצלח */
export class CreatePlacementDto {
  @IsString()
  jobId!: string;

  @IsString()
  candidateId!: string;

  @IsString()
  employerId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionAmount?: number; // בשקלים

  @IsOptional()
  @IsString()
  notes?: string;
}
