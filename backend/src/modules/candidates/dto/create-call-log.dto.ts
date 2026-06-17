import {
  IsDateString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/** רשומת שיחה ידנית שהצוות מוסיף לכרטיס מועמד (סעיף 7.2 — היסטוריית שיחות). */
export class CreateCallLogDto {
  @IsString()
  @MinLength(1)
  staffName!: string; // מי מהצוות התקשר

  @IsString()
  @MinLength(2)
  summary!: string; // סיכום השיחה

  @IsOptional()
  @IsDateString({}, { message: 'תאריך תזכורת לא תקין' })
  followUpAt?: string; // תזכורת לשיחה חוזרת (אופציונלי)
}
