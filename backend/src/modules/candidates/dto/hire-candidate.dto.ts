import { IsNumber, IsString, Min } from "class-validator";

/**
 * סימון מועמד כגויס — יוצר רשומת Placement ומתחיל מעקב עמלה.
 * jobId חייב להיות אחת מהמשרות שהמועמד הוצג אליהן.
 * commissionAmount חובה — בלי סכום אי אפשר לעקוב אחר העמלה.
 */
export class HireCandidateDto {
  @IsString()
  jobId!: string;

  @IsNumber()
  @Min(0)
  commissionAmount!: number; // בשקלים
}
