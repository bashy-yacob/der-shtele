import { IsString, MinLength } from "class-validator";

/** שמירת משרה ללב — מזהה המשרה בלבד (המשתמש נלקח מה-token). */
export class SaveJobDto {
  @IsString()
  @MinLength(1)
  jobId!: string;
}
