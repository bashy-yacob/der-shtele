import { IsEnum, IsOptional } from "class-validator";
import { EmployerStatus } from "@prisma/client";
import { PaginationQueryDto } from "../../../common/pagination/pagination-query.dto";

/**
 * פילטרים לרשימת המעסיקים (עם עימוד).
 * status ריק → מוחזרים כל מי שאינם pending (הממתינים מוצגים בנפרד ככרטיסים).
 */
export class QueryEmployersDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(EmployerStatus)
  status?: EmployerStatus;
}
