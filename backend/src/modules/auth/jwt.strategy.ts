import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../../common/decorators/current-user.decorator';

export interface JwtPayload {
  sub: string;
  email: string;
  fullName: string;
  role: string;
  candidateId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // ללא ברירת מחדל — נכשל באתחול אם JWT_SECRET חסר, כדי שלא ירוץ עם סוד ציבורי ידוע.
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** ה-payload המאומת הופך ל-request.user */
  validate(payload: JwtPayload): AuthUser {
    return {
      userId: payload.sub,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
      candidateId: payload.candidateId,
    };
  }
}
