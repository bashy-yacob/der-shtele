import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/** סוגי קבצים מותרים לקו"ח (PDF / Word). */
export const RESUME_ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/** גודל מירבי לקו"ח — 5MB. */
export const RESUME_MAX_SIZE = 5 * 1024 * 1024;

/**
 * אפשרויות FileInterceptor משותפות להעלאת קו"ח.
 * - `limits.fileSize` עוצר את multer מוקדם כך שגוף ענק לא נטען כולו לזיכרון (הגנת DoS).
 * - `fileFilter` דוחה סוג לא נתמך עוד לפני שמירה, עם 400 ברור.
 */
export const resumeUploadOptions: MulterOptions = {
  limits: { fileSize: RESUME_MAX_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!RESUME_ALLOWED_TYPES.includes(file.mimetype)) {
      cb(
        new BadRequestException(
          'קובץ קורות חיים חייב להיות בפורמט PDF או Word.',
        ),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
