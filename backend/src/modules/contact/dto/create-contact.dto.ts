import { IsEnum, IsString, Matches, MinLength } from 'class-validator';

export enum InquiryType {
  candidate = 'candidate',
  employer = 'employer',
  general = 'general',
}

export class CreateContactDto {
  @IsString()
  @MinLength(2, { message: 'שם חייב להיות לפחות 2 תווים' })
  name!: string;

  @Matches(/^05[0-9]{8}$/, { message: 'מספר טלפון לא תקין' })
  phone!: string;

  @IsEnum(InquiryType, { message: 'נא לבחור סוג פנייה' })
  inquiry_type!: InquiryType;

  @IsString()
  @MinLength(10, { message: 'ההודעה חייבת להיות לפחות 10 תווים' })
  message!: string;
}
