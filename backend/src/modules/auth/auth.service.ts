import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateMeDto } from "./dto/update-me.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AuthService {
  /** קליינט Google OAuth — מאתחל פעם אחת עם ה-redirect URI הקבוע. */
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      config.get<string>("GOOGLE_CLIENT_ID"),
      config.get<string>("GOOGLE_CLIENT_SECRET"),
      config.get<string>("GOOGLE_CALLBACK_URL"),
    );
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException("כתובת אימייל זו כבר רשומה");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: "candidate",
        optInMarketing: dto.optInMarketing,
        optInAt: dto.optInMarketing ? new Date() : null,
      },
    });

    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    // passwordHash יכול להיות null למשתמש שנוצר רק דרך Google — אז אין כניסה בסיסמה.
    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException("אימייל או סיסמה שגויים");
    }
    return this.issueToken(user);
  }

  /**
   * התחברות/הרשמה דרך Google (Authorization Code).
   * הפרונט מעביר רק את ה-code; כאן מבצעים exchange, מאמתים את ה-id_token,
   * ומבצעים find-or-create-and-link לפי googleId ואז לפי אימייל.
   */
  async loginWithGoogle(code: string) {
    let idToken: string | undefined;
    try {
      const { tokens } = await this.googleClient.getToken(code);
      idToken = tokens.id_token ?? undefined;
    } catch {
      throw new UnauthorizedException("אימות מול Google נכשל");
    }
    if (!idToken) throw new UnauthorizedException("אימות מול Google נכשל");

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.get<string>("GOOGLE_CLIENT_ID"),
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new UnauthorizedException("אימות מול Google נכשל");
    }
    // אימייל לא מאומת בגוגל — אסור לקשר אוטומטית (סיכון השתלטות חשבון).
    if (payload.email_verified === false) {
      throw new UnauthorizedException(
        "כתובת האימייל בחשבון Google אינה מאומתת",
      );
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const fullName = payload.name?.trim() || email.split("@")[0];
    const picture = payload.picture ?? null;

    // 1. משתמש Google קיים — לפי המזהה היציב (sub), לא לפי אימייל שיכול להשתנות.
    let user = await this.prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      // 2. קישור אוטומטי לחשבון קיים עם אותו אימייל (גם אם יש לו סיסמה —
      //    Google כבר אימתה בעלות על האימייל). לא דורסים את authProvider כדי
      //    שמשתמש עם סיסמה ימשיך להתחבר גם בסיסמה.
      const byEmail = await this.prisma.user.findUnique({ where: { email } });
      if (byEmail) {
        user = await this.prisma.user.update({
          where: { id: byEmail.id },
          data: {
            googleId,
            profilePicture: byEmail.profilePicture ?? picture,
          },
        });
      } else {
        // 3. משתמש חדש לגמרי — ללא סיסמה, opt-in כבוי. התזכורת החודשית באזור
        //    האישי תציע לו להירשם לדיוור.
        user = await this.prisma.user.create({
          data: {
            email,
            fullName,
            googleId,
            authProvider: "google",
            profilePicture: picture,
            role: "candidate",
            optInMarketing: false,
            optInAt: null,
          },
        });
      }
    }

    return this.issueToken(user);
  }

  /** פרטי המשתמש המחובר — כולל העדפת דיוור ופרטי פרופיל עדכניים מה-DB. */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("משתמש לא נמצא");
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      optInMarketing: user.optInMarketing,
      // פרטי פרופיל לדיוור מותאם אישית
      phone: user.phone,
      city: user.city,
      preferredField: user.preferredField,
      yearsExperience: user.yearsExperience,
      // לתזכורת ה-opt-in החודשית בפרונט (משתמשי Google שלא אישרו דיוור)
      optInPromptedAt: user.optInPromptedAt,
      authProvider: user.authProvider,
    };
  }

  /** מסמן שתזכורת ה-opt-in הוצגה כעת — מאפס את ספירת ה-~30 יום הבאים. */
  async markOptInPrompted(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { optInPromptedAt: new Date() },
    });
    return { ok: true };
  }

  /**
   * עדכון חלקי של פרטי המשתמש — העדפת דיוור ופרטי פרופיל לדיוור מותאם.
   * רק שדות שנשלחו (!== undefined) מתעדכנים; שליחת null מנקה שדה אופציונלי.
   */
  async updateProfile(userId: string, dto: UpdateMeDto) {
    const data: Prisma.UserUpdateInput = {};

    if (dto.optInMarketing !== undefined) {
      data.optInMarketing = dto.optInMarketing;
      // הסכמה חדשה → חותמים זמן (חוק הספאם); בכיבוי משאירים את ההיסטוריה.
      if (dto.optInMarketing) data.optInAt = new Date();
    }
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.preferredField !== undefined) {
      data.preferredField = dto.preferredField;
    }
    if (dto.yearsExperience !== undefined) {
      data.yearsExperience = dto.yearsExperience;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      optInMarketing: user.optInMarketing,
      phone: user.phone,
      city: user.city,
      preferredField: user.preferredField,
      yearsExperience: user.yearsExperience,
    };
  }

  /** שינוי סיסמה — מאמת את הסיסמה הנוכחית לפני העדכון. */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("משתמש לא נמצא");
    // משתמש שמחובר רק דרך Google אין לו סיסמה מקומית לשנות.
    if (!user.passwordHash) {
      throw new BadRequestException(
        "החשבון מחובר דרך Google ואין לו סיסמה לשינוי",
      );
    }

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException("הסיסמה הנוכחית שגויה");

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException("הסיסמה החדשה זהה לנוכחית");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: "הסיסמה עודכנה בהצלחה" };
  }

  private issueToken(user: {
    id: string;
    email: string;
    role: string;
    fullName: string;
    candidateId: string | null;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      candidateId: user.candidateId,
    };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
