import { BadRequestException } from "@nestjs/common";
import type { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

/**
 * סוגי תמונה מותרים לבאנר מודעה (ללא תמונות אנשים — נאכף ע"י אישור הצוות).
 * GIF ו-WebP מונפשים מתנגנים אוטומטית בתוך `<img>` — כך נתמכות מודעות מונפשות
 * "כמו גיפים" בלי נגן וידאו. וידאו MP4 (`<video>`) לא נתמך בכוונה בשלב זה.
 */
export const AD_IMAGE_ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

/**
 * גודל מירבי לתמונת באנר — 5MB. מוגדל מ-2MB כדי לאפשר מודעה מונפשת (GIF/WebP),
 * שכבדה מתמונה סטטית. עדיין תחום כדי לשמור על טעינה קלה — עדיפות ל-WebP מונפש
 * (קל ואיכותי יותר מ-GIF) ולאנימציה עדינה (הכלל "ללא אנימציות פולשניות").
 */
export const AD_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

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
        new BadRequestException(
          "תמונת מודעה חייבת להיות PNG, JPG, GIF או WebP.",
        ),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
