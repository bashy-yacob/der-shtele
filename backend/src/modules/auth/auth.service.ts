import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('כתובת אימייל זו כבר רשומה');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: 'candidate',
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
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }
    return this.issueToken(user);
  }

  /** פרטי המשתמש המחובר — כולל העדפת דיוור עדכנית מה-DB (לא מה-token). */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('משתמש לא נמצא');
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      optInMarketing: user.optInMarketing,
    };
  }

  /** עדכון העדפת דיוור (opt-in / opt-out). */
  async updateProfile(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        optInMarketing: dto.optInMarketing,
        // הסכמה חדשה → חותמים זמן (חוק הספאם); בכיבוי משאירים את ההיסטוריה.
        ...(dto.optInMarketing ? { optInAt: new Date() } : {}),
      },
    });
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      optInMarketing: user.optInMarketing,
    };
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
