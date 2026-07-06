import { IsEnum, IsIn, IsOptional } from "class-validator";
import { InquiryType } from "./create-contact.dto";
import { PaginationQueryDto } from "../../../common/pagination/pagination-query.dto";

/** פילטרים לרשימת הפניות הנכנסות (עם עימוד). */
export class QueryContactsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(InquiryType)
  type?: InquiryType;

  // open = טרם טופל · handled = טופל · ריק = הכל
  @IsOptional()
  @IsIn(["open", "handled"])
  handled?: "open" | "handled";
}
