import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'נא להזין סיסמה' })
  password!: string;
}
