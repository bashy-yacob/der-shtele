import { PartialType } from "@nestjs/mapped-types";
import { IsDateString, IsEnum, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { JobStatus, AdPaymentStatus } from "@prisma/client";
import { CreateJobDto } from "./create-job.dto";

export class UpdateJobDto extends PartialType(CreateJobDto) {
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  // --- קידום בתשלום (Featured) — נשלט מהדשבורד; שער prepaid נאכף בשירות ---
  @IsOptional()
  @IsDateString()
  featuredUntil?: string;

  @IsOptional()
  @IsEnum(AdPaymentStatus)
  featuredPaymentStatus?: AdPaymentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  featuredPrice?: number;
}
