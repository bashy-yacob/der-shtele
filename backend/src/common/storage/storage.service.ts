import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import { join } from "path";
import { RESUME_ALLOWED_TYPES, RESUME_MAX_SIZE } from "./resume-upload.options";
import {
  AD_IMAGE_ALLOWED_TYPES,
  AD_IMAGE_MAX_SIZE,
} from "./ad-image-upload.options";
import {
  PARTNER_LOGO_ALLOWED_TYPES,
  PARTNER_LOGO_MAX_SIZE,
} from "./partner-logo-upload.options";

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
  // bucket ציבורי לתמונות באנרים — שונה מ-resumes (פרטי). public URL ללא חתימה.
  private readonly adsBucket: string;
  // bucket ציבורי ללוגואים של שותפים — ציבורי כמו ads, מופרד לוגית.
  private readonly partnersBucket: string;
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;
  private readonly localDir: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>("SUPABASE_RESUME_BUCKET", "resumes");
    this.adsBucket = this.config.get<string>("SUPABASE_ADS_BUCKET", "ads");
    this.partnersBucket = this.config.get<string>(
      "SUPABASE_PARTNERS_BUCKET",
      "partners",
    );
    this.supabaseUrl = this.config.get<string>("SUPABASE_URL", "");
    this.supabaseKey = this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY", "");
    this.localDir = this.config.get<string>(
      "LOCAL_UPLOAD_DIR",
      join(process.cwd(), "uploads"),
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

  /** מאמת ומעלה קובץ קו"ח, מחזיר את הנתיב לשמירה במסד. */
  async uploadResume(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): Promise<string> {
    // רשת ביטחון נוספת ל-fileFilter/limits של multer — קלט שגוי = 400, לא 500.
    if (!RESUME_ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        "קובץ קורות חיים חייב להיות בפורמט PDF או Word.",
      );
    }
    if (file.size > RESUME_MAX_SIZE) {
      throw new BadRequestException(
        "קובץ קורות חיים גדול מדי. גודל מירבי הוא 5MB.",
      );
    }

    // לא סומכים על originalname — מנקים את הסיומת לאותיות/ספרות בלבד.
    const ext = (file.originalname.split(".").pop() ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 5);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    if (this.useSupabase) {
      const { data, error } = await this.client.storage
        .from(this.bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error("Supabase upload failed", error.message);
        throw new InternalServerErrorException("שגיאה בהעלאת קורות החיים.");
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
      this.logger.error("Local resume save failed", err as Error);
      throw new InternalServerErrorException("שגיאה בשמירת קורות החיים.");
    }
  }

  /**
   * מחזיר קישור/נתיב לצפייה בקו"ח (לשימוש פנימי של הצוות).
   * - Supabase: signed URL זמני.
   * - מקומי: נתיב הקובץ בדיסק השרת.
   */
  async getSignedUrl(path: string, expiresInSec = 3600): Promise<string> {
    if (path.startsWith("local/")) {
      return join(this.localDir, path.replace(/^local\//, ""));
    }

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSec);

    if (error || !data) {
      this.logger.error("Signed URL failed", error?.message);
      throw new InternalServerErrorException("שגיאה ביצירת קישור לקובץ.");
    }
    return data.signedUrl;
  }

  // ----------------------------------------------------------------
  // תמונות באנרים — bucket ציבורי (שלב ד). שונה מקו"ח: ה-URL ציבורי וקבוע,
  // ללא חתימה/תפוגה. כלל ברזל: ללא תמונות אנשים (נאכף ע"י אישור הצוות).
  // ----------------------------------------------------------------

  /** מאמת ומעלה תמונת באנר ל-bucket הציבורי, מחזיר את הנתיב לשמירה במסד. */
  async uploadAdImage(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): Promise<string> {
    if (!AD_IMAGE_ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        "תמונת מודעה חייבת להיות PNG, JPG או WebP.",
      );
    }
    if (file.size > AD_IMAGE_MAX_SIZE) {
      throw new BadRequestException(
        "תמונת מודעה גדולה מדי. גודל מירבי הוא 2MB.",
      );
    }

    const ext = (file.originalname.split(".").pop() ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 5);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    if (this.useSupabase) {
      const { data, error } = await this.client.storage
        .from(this.adsBucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error("Supabase ad upload failed", error.message);
        throw new InternalServerErrorException("שגיאה בהעלאת תמונת המודעה.");
      }
      return data.path;
    }

    // --- אחסון מקומי dev-only (אין Supabase מוגדר) ---
    try {
      const adsDir = join(this.localDir, "ads");
      await fs.mkdir(adsDir, { recursive: true });
      await fs.writeFile(join(adsDir, fileName), file.buffer);
      this.logger.log(`תמונת מודעה נשמרה מקומית: ${fileName}`);
      return `local/ads/${fileName}`;
    } catch (err) {
      this.logger.error("Local ad image save failed", err as Error);
      throw new InternalServerErrorException("שגיאה בשמירת תמונת המודעה.");
    }
  }

  /**
   * מחזיר URL ציבורי לתמונת באנר (להצגה באתר). bucket ציבורי → getPublicUrl
   * (סינכרוני, ללא חתימה/תפוגה). נתיב מקומי dev-only מוחזר כמו שהוא (לא נטען
   * בדפדפן — ה-AdBanner מתדרדר לטקסט בלבד).
   */
  getAdImageUrl(path: string): string {
    if (!path) return "";
    if (path.startsWith("local/")) return path;
    if (!this.useSupabase) return path;
    const { data } = this.client.storage
      .from(this.adsBucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  /** מחיקת תמונת באנר (best-effort) — בעת מחיקת מודעה. */
  async deleteAdImage(path: string): Promise<void> {
    if (!path) return;
    if (path.startsWith("local/")) {
      await fs
        .unlink(join(this.localDir, path.replace(/^local\//, "")))
        .catch(() => undefined);
      return;
    }
    if (!this.useSupabase) return;
    await this.client.storage.from(this.adsBucket).remove([path]);
  }

  // ----------------------------------------------------------------
  // לוגואים של שותפים — bucket ציבורי ('partners'). באותה תבנית של תמונות
  // באנרים: URL ציבורי וקבוע, ללא חתימה/תפוגה. כלל ברזל: לוגו בלבד, ללא
  // תמונות אנשים (נאכף ע"י אישור הצוות בעת ההוספה).
  // ----------------------------------------------------------------

  /** מאמת ומעלה לוגו שותף ל-bucket הציבורי, מחזיר את הנתיב לשמירה במסד. */
  async uploadPartnerLogo(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  }): Promise<string> {
    if (!PARTNER_LOGO_ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("לוגו שותף חייב להיות PNG, JPG או WebP.");
    }
    if (file.size > PARTNER_LOGO_MAX_SIZE) {
      throw new BadRequestException("לוגו שותף גדול מדי. גודל מירבי הוא 1MB.");
    }

    const ext = (file.originalname.split(".").pop() ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 5);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    if (this.useSupabase) {
      const { data, error } = await this.client.storage
        .from(this.partnersBucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error("Supabase partner logo upload failed", error.message);
        throw new InternalServerErrorException("שגיאה בהעלאת לוגו השותף.");
      }
      return data.path;
    }

    // --- אחסון מקומי dev-only (אין Supabase מוגדר) ---
    try {
      const partnersDir = join(this.localDir, "partners");
      await fs.mkdir(partnersDir, { recursive: true });
      await fs.writeFile(join(partnersDir, fileName), file.buffer);
      this.logger.log(`לוגו שותף נשמר מקומית: ${fileName}`);
      return `local/partners/${fileName}`;
    } catch (err) {
      this.logger.error("Local partner logo save failed", err as Error);
      throw new InternalServerErrorException("שגיאה בשמירת לוגו השותף.");
    }
  }

  /**
   * מחזיר URL ציבורי ללוגו שותף (להצגה באתר). bucket ציבורי → getPublicUrl
   * (סינכרוני). נתיב מקומי dev-only מוחזר כמו שהוא (לא נטען בדפדפן).
   */
  getPartnerLogoUrl(path: string): string {
    if (!path) return "";
    if (path.startsWith("local/")) return path;
    if (!this.useSupabase) return path;
    const { data } = this.client.storage
      .from(this.partnersBucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  /** מחיקת לוגו שותף (best-effort) — בעת מחיקת שותף. */
  async deletePartnerLogo(path: string): Promise<void> {
    if (!path) return;
    if (path.startsWith("local/")) {
      await fs
        .unlink(join(this.localDir, path.replace(/^local\//, "")))
        .catch(() => undefined);
      return;
    }
    if (!this.useSupabase) return;
    await this.client.storage.from(this.partnersBucket).remove([path]);
  }
}
