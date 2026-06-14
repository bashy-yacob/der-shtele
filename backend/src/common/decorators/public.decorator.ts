import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * מסמן route כציבורי — עוקף את ה-JwtAuthGuard הגלובלי.
 * שימוש על endpoints של האתר הציבורי (לוח משרות, צור קשר).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
