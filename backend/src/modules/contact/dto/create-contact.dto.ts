import { IsEnum, IsString, Matches, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export enum InquiryType {
  candidate = 'candidate',
  employer = 'employer',
  general = 'general',
}

export class CreateContactDto {
  @IsString()
  @MinLength(2, { message: 'שם חייב להיות לפחות 2 תווים' })
  name!: string;

  // מנרמל מקפים/רווחים לפני הוולידציה — תואם את ה-placeholder עם מקפים בטופס.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Matches(/^05\d{8}$/, { message: 'מספר טלפון לא תקין' })
  phone!: string;

  @IsEnum(InquiryType, { message: 'נא לבחור סוג פנייה' })
  inquiry_type!: InquiryType;

  @IsString()
  @MinLength(10, { message: 'ההודעה חייבת להיות לפחות 10 תווים' })
  message!: string;
}
