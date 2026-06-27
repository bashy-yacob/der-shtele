import {
  IsBoolean,
  IsEmail,
  IsString,
  MinLength,
  Equals,
} from "class-validator";

/** הרשמת מעסיק עצמית כ"בקשת גישה" (סעיף 6) — יוצרת Employer(pending)+User(employer). */
export class EmployerRegisterDto {
  @IsString()
  @MinLength(2, { message: "נא להזין שם חברה" })
  companyName!: string;

  @IsString()
  @MinLength(2, { message: "נא להזין שם איש קשר" })
  contactName!: string;

  @IsString()
  @MinLength(9, { message: "מספר טלפון לא תקין" })
  contactPhone!: string;

  @IsEmail({}, { message: "כתובת אימייל לא תקינה" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "הסיסמה חייבת להכיל לפחות 8 תווים" })
  password!: string;

  // opt-in חובה — חייב להיות true כדי להירשם (חוק הספאם הישראלי)
  @IsBoolean()
  @Equals(true, { message: "יש לאשר קבלת עדכונים כדי להירשם" })
  optInMarketing!: boolean;
}
