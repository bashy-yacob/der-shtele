import { IsOptional, IsString, MaxLength } from "class-validator";

/** דחיית בקשת גישה של מעסיק — סיבה אופציונלית שתישלח במייל. */
export class RejectEmployerDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
