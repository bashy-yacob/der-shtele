import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // CORS — רק ל-frontend (לא לדומיינים זרים)
  app.enableCors({
    origin: config.get<string>('FRONTEND_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // ולידציה גלובלית — מסירה שדות לא מוכרים, ממירה טיפוסים
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // עוטף כל תגובה ב-{ success: true, data } ושגיאות ב-{ success: false, error }
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // כל ה-API תחת /api, אך השורש ובדיקת הבריאות נשארים מחוץ ל-prefix
  app.setGlobalPrefix('api', { exclude: ['/', 'health'] });

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 דער שטעלע backend רץ על http://localhost:${port}/api`);
}

bootstrap();
