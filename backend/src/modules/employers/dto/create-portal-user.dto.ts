import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

/** יצירת משתמש פורטל למעסיק — הצוות מפיק את פרטי הכניסה. */
export class CreatePortalUserDto {
  @IsEmail({}, { message: "כתובת אימייל לא תקינה" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "סיסמה חייבת להיות לפחות 8 תווים" })
  password!: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
