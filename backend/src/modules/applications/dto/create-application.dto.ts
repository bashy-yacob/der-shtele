import { IsOptional, IsString } from 'class-validator';

/** הצגת מועמד למשרה (presentation) */
export class CreateApplicationDto {
  @IsString()
  jobId!: string;

  @IsString()
  candidateId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
