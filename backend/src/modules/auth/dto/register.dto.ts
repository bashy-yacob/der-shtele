import {
  IsBoolean,
  IsEmail,
  IsString,
  MinLength,
  Equals,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'נא להזין שם מלא' })
  fullName!: string;

  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'הסיסמה חייבת להכיל לפחות 8 תווים' })
  password!: string;

  // opt-in חובה — חייב להיות true כדי להירשם
  @IsBoolean()
  @Equals(true, { message: 'יש לאשר קבלת עדכונים כדי להירשם' })
  optInMarketing!: boolean;
}
