import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

/**
 * Controller בשורש (מחוץ ל-prefix /api).
 * - `GET /`       — עמוד בית ידידותי שמאשר שהשרת חי (במקום "Cannot GET /").
 * - `GET /health` — בדיקת בריאות ל-uptime monitors ול-cold-start של Render.
 */
@Controller()
export class AppController {
  @Public()
  @Get()
  getRoot() {
    return {
      name: 'דער שטעלע API',
      status: 'ok',
      message: 'השרת רץ. נקודות הקצה זמינות תחת /api',
    };
  }

  @Public()
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
