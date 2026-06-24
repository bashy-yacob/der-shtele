import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { UpdateMeDto } from "./dto/update-me.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { Public } from "../../common/decorators/public.decorator";
import {
  CurrentUser,
  AuthUser,
} from "../../common/decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** התחברות/הרשמה דרך Google — מקבל code מה-callback (proxy בפרונט). */
  @Public()
  @Post("google")
  loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto.code);
  }

  /** אימות כתובת מייל לפי טוקן מהקישור במייל (סעיף 3.1). */
  @Public()
  @Post("verify")
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  /** שליחה חוזרת של מייל האימות למשתמש המחובר. */
  @Post("me/resend-verification")
  resendVerification(@CurrentUser() user: AuthUser) {
    return this.authService.resendVerification(user.userId);
  }

  /** מחזיר את המשתמש המחובר (דורש token תקין) — כולל העדפת דיוור עדכנית. */
  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.userId);
  }

  /** עדכון העדפות המשתמש (opt-out לדיוור). */
  @Patch("me")
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    return this.authService.updateProfile(user.userId, dto);
  }

  /** שינוי סיסמה למשתמש המחובר. */
  @Patch("me/password")
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }

  /** סימון שתזכורת ה-opt-in הוצגה כעת (מאפס את הספירה ל-~30 יום הבאים). */
  @Post("me/optin-prompted")
  markOptInPrompted(@CurrentUser() user: AuthUser) {
    return this.authService.markOptInPrompted(user.userId);
  }
}
