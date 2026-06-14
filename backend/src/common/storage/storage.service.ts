import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * StorageService — אחסון קורות חיים.
 *
 * שני מצבים, נבחרים אוטומטית:
 *  1. Supabase Storage (bucket פרטי) — כאשר SUPABASE_URL + SERVICE_ROLE_KEY מוגדרים.
 *     הגישה לקבצים רק דרך signed URLs עם תפוגה.
 *  2. דיסק מקומי (LOCAL_UPLOAD_DIR, ברירת מחדל ./uploads) — כשאין הגדרת Supabase.
 *     מאפשר לאתר לעבוד "על אמיתי" בפיתוח בלי שירות חיצוני.
 *
 * נתיב מקומי נשמר עם הקידומת `local/` כדי שנדע איך לאחזר אותו.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private _client: SupabaseClient | null = null;

  private readonly bucket: string;
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;
  private readonly localDir: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('SUPABASE_RESUME_BUCKET', 'resumes');
    this.supabaseUrl = this.config.get<string>('SUPABASE_URL', '');
    this.supabaseKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY', '');
    this.localDir = this.config.get<string>(
      'LOCAL_UPLOAD_DIR',
      join(process.cwd(), 'uploads'),
    );
  }

  /** האם Supabase Storage מוגדר? אם לא — נופלים לאחסון מקומי. */
  private get useSupabase(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseKey);
  }

  /** לקוח Supabase בעצלתיים — נוצר רק כשבאמת מעלים/מורידים. */
  private get client(): SupabaseClient {
    if (!this._client) {
      // service role — לא anon key. נשמר בצד שרת בלבד.
      this._client = createClient(this.supabaseUrl, this.supabaseKey, {
        auth: { persistSession: false },
      });
    }
    return this._client;
  }

  private readonly allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  private readonly maxSize = 5 * 1024 * 1024; // 5MB

  /** מאמת ומעלה קובץ קו"ח, מחזיר את הנתיב לשמירה במסד. */
  async uploadResume(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): Promise<string> {
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new InternalServerErrorException(
        'קובץ קורות חיים חייב להיות בפורמט PDF או Word.',
      );
    }
    if (file.size > this.maxSize) {
      throw new InternalServerErrorException(
        'קובץ קורות חיים גדול מדי. גודל מירבי הוא 5MB.',
      );
    }

    const ext = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    if (this.useSupabase) {
      const { data, error } = await this.client.storage
        .from(this.bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error('Supabase upload failed', error.message);
        throw new InternalServerErrorException('שגיאה בהעלאת קורות החיים.');
      }
      return data.path;
    }

    // --- אחסון מקומי (אין Supabase מוגדר) ---
    try {
      await fs.mkdir(this.localDir, { recursive: true });
      await fs.writeFile(join(this.localDir, fileName), file.buffer);
      this.logger.log(
        `קו"ח נשמר מקומית: ${fileName} (Supabase Storage לא מוגדר)`,
      );
      return `local/${fileName}`;
    } catch (err) {
      this.logger.error('Local resume save failed', err as Error);
      throw new InternalServerErrorException('שגיאה בשמירת קורות החיים.');
    }
  }

  /**
   * מחזיר קישור/נתיב לצפייה בקו"ח (לשימוש פנימי של הצוות).
   * - Supabase: signed URL זמני.
   * - מקומי: נתיב הקובץ בדיסק השרת.
   */
  async getSignedUrl(path: string, expiresInSec = 3600): Promise<string> {
    if (path.startsWith('local/')) {
      return join(this.localDir, path.replace(/^local\//, ''));
    }

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSec);

    if (error || !data) {
      this.logger.error('Signed URL failed', error?.message);
      throw new InternalServerErrorException('שגיאה ביצירת קישור לקובץ.');
    }
    return data.signedUrl;
  }
}
