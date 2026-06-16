import { IsBoolean } from 'class-validator';

/** עדכון פרטי המשתמש המחובר — כרגע רק העדפת דיוור (opt-in/opt-out). */
export class UpdateMeDto {
  @IsBoolean()
  optInMarketing!: boolean;
}
