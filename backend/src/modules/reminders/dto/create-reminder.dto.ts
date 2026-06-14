import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  @MinLength(2)
  message!: string;

  @IsDateString({}, { message: 'תאריך תזכורת לא תקין' })
  remindAt!: string;

  @IsString()
  createdBy!: string; // שם נציג

  @IsOptional()
  @IsString()
  candidateId?: string;

  @IsOptional()
  @IsString()
  jobId?: string;
}
