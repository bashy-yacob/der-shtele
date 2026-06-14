import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CandidateStatus } from '@prisma/client';

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
