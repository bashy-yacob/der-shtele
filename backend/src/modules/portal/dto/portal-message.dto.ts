import { IsString, MinLength } from "class-validator";

/** הודעת מעסיק לצוות (תקשורת מהפורטל). */
export class PortalMessageDto {
  @IsString()
  @MinLength(2, { message: "ההודעה קצרה מדי" })
  message!: string;
}
