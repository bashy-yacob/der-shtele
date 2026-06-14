import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PlacementStatus } from '@prisma/client';

export class UpdatePlacementDto {
  @IsOptional()
  @IsEnum(PlacementStatus)
  status?: PlacementStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
