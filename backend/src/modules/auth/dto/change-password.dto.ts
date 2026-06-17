import { IsString, MinLength } from "class-validator";

/** שינוי סיסמה למשתמש המחובר — דורש אימות הסיסמה הנוכחית. */
export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: "הסיסמה חייבת להכיל לפחות 8 תווים" })
  newPassword!: string;
}
