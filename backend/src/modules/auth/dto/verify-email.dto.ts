import { IsString, IsNotEmpty } from "class-validator";

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty({ message: "טוקן אימות חסר" })
  token!: string;
}
