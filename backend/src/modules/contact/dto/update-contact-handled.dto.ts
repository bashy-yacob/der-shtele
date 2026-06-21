import { IsBoolean } from "class-validator";

/** סימון/ביטול סימון פנייה כ"טופל" ע"י הצוות. */
export class UpdateContactHandledDto {
  @IsBoolean()
  handled!: boolean;
}
