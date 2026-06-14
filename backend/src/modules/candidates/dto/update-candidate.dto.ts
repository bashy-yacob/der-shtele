import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CandidateStatus } from '@prisma/client';

export class UpdateCandidateDto {
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
