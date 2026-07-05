import { BadRequestException } from "@nestjs/common";
import type { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

/** סוגי תמונה מותרים ללוגו שותף (לוגו בלבד — ללא תמונות אנשים; נאכף ע"י אישור הצוות). */
export const PARTNER_LOGO_ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

/** גודל מירבי ללוגו שותף — 1MB (לוגו קל, לא צילום). */
export const PARTNER_LOGO_MAX_SIZE = 1 * 1024 * 1024;

/**
 * אפשרויות FileInterceptor להעלאת לוגו שותף.
 * - `limits.fileSize` עוצר את multer מוקדם (הגנת DoS).
 * - `fileFilter` דוחה סוג לא נתמך עם 400 ברור עוד לפני שמירה.
 */
export const partnerLogoUploadOptions: MulterOptions = {
  limits: { fileSize: PARTNER_LOGO_MAX_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!PARTNER_LOGO_ALLOWED_TYPES.includes(file.mimetype)) {
      cb(
        new BadRequestException("לוגו שותף חייב להיות PNG, JPG או WebP."),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
