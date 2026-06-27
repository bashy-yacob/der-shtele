import { BadRequestException } from "@nestjs/common";
import type { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

/** סוגי תמונה מותרים לבאנר מודעה (ללא תמונות אנשים — נאכף ע"י אישור הצוות). */
export const AD_IMAGE_ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

/** גודל מירבי לתמונת באנר — 2MB. */
export const AD_IMAGE_MAX_SIZE = 2 * 1024 * 1024;

/**
 * אפשרויות FileInterceptor להעלאת תמונת באנר מודעה.
 * - `limits.fileSize` עוצר את multer מוקדם (הגנת DoS).
 * - `fileFilter` דוחה סוג לא נתמך עם 400 ברור עוד לפני שמירה.
 */
export const adImageUploadOptions: MulterOptions = {
  limits: { fileSize: AD_IMAGE_MAX_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!AD_IMAGE_ALLOWED_TYPES.includes(file.mimetype)) {
      cb(
        new BadRequestException("תמונת מודעה חייבת להיות PNG, JPG או WebP."),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
