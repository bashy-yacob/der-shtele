import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { MAX_PAGE_SIZE } from "./pagination";

/**
 * בסיס לפילטרים עם עימוד — page / pageSize / search.
 * ה-ValidationPipe רץ עם transform:true, לכן @Type ממיר את מחרוזות ה-query למספרים.
 * מודולים יורשים ומוסיפים פילטרים ייעודיים (תחום/אזור/סטטוס וכו').
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
