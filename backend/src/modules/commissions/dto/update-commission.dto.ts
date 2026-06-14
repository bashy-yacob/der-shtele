import { IsEnum } from 'class-validator';
import { CommissionStatus } from '@prisma/client';

export class UpdateCommissionDto {
  @IsEnum(CommissionStatus)
  status!: CommissionStatus;
}
