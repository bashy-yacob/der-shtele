import { IsNotEmpty, IsString } from "class-validator";

/** קוד ה-authorization שהתקבל מ-Google (זרימת Authorization Code). */
export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty({ message: "קוד אימות חסר" })
  code!: string;
}
