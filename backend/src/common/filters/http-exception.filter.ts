import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * הופך כל שגיאה לתגובה אחידה: { success: false, error }.
 * הודעות שגיאה בעברית, ידידותיות למשתמש.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'שגיאת שרת';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        error = res;
      } else if (typeof res === 'object' && res !== null) {
        const message = (res as Record<string, unknown>).message;
        error = Array.isArray(message)
          ? message.join(', ')
          : String(message ?? error);
      }
    } else if (exception instanceof Error) {
      // מתעדים את הפרטים בצד שרת בלבד; ללקוח מחזירים 'שגיאת שרת' גנרי
      // כדי לא לחשוף מבנה DB / מחרוזות חיבור / פנימיות.
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({ success: false, error });
  }
}
