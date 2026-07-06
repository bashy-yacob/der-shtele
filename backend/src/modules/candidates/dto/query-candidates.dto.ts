import { IsEnum, IsOptional, IsString } from "class-validator";
import { CandidateStatus, JobField } from "@prisma/client";
import { PaginationQueryDto } from "../../../common/pagination/pagination-query.dto";

/** פילטרים לרשימת המועמדים בצוות (עם עימוד). */
export class QueryCandidatesDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(JobField)
  field?: JobField;

  @IsOptional()
  @IsString()
  region?: string; // עיר/אזור — טקסט חופשי

  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;
}
