import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // ללא ברירת מחדל — נכשל באתחול אם JWT_SECRET חסר (אותו סוד כמו ב-JwtStrategy).
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          // תקרת תוקף מוחלטת לטוקן (רשת ביטחון). ניתוק חוסר-פעילות בפועל (3 ימים)
          // נאכף בצד הלקוח ב-useAuth; תקרה זו רחבה ממנו כדי לא לנתק משתמש פעיל.
          expiresIn: config.get<string>("JWT_EXPIRES_IN", "30d"),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
