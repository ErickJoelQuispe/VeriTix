import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify } from 'jose';
import { JwtPayload } from '@common/interfaces';

export interface RefreshPayload {
  sub: string;
  jti: string;
}

@Injectable()
export class JwtTokenService {
  private readonly accessSecret: Uint8Array;
  private readonly accessExpiration: string;
  private readonly issuer: string;

  private readonly refreshSecret: Uint8Array;
  private readonly refreshExpiration: string;

  constructor(private readonly config: ConfigService) {
    this.accessSecret = new TextEncoder().encode(
      config.getOrThrow<string>('JWT_SECRET'),
    );
    this.accessExpiration = config.get<string>('JWT_EXPIRATION', '15m')!;
    this.issuer = config.get<string>('JWT_ISSUER', 'veritix-api')!;

    this.refreshSecret = new TextEncoder().encode(
      config.getOrThrow<string>('JWT_REFRESH_SECRET'),
    );
    this.refreshExpiration = config.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    )!;
  }

  signAccess(payload: JwtPayload): Promise<string> {
    return new SignJWT({ email: payload.email, role: payload.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setExpirationTime(this.accessExpiration)
      .sign(this.accessSecret);
  }

  async verifyAccess(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, this.accessSecret, {
      issuer: this.issuer,
      algorithms: ['HS256'],
    });

    return {
      sub: payload.sub as string,
      email: payload['email'] as string,
      role: payload['role'] as JwtPayload['role'],
      iat: payload.iat,
      exp: payload.exp,
    };
  }

  signRefresh(userId: string, jti: string): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setJti(jti)
      .setExpirationTime(this.refreshExpiration)
      .sign(this.refreshSecret);
  }

  async verifyRefresh(token: string): Promise<RefreshPayload> {
    const { payload } = await jwtVerify(token, this.refreshSecret, {
      issuer: this.issuer,
      algorithms: ['HS256'],
    });

    return {
      sub: payload.sub as string,
      jti: payload.jti as string,
    };
  }

  /** Convierte un string de duración ('7d', '15m', '1h') a milisegundos para la cookie. */
  static parseDurationMs(duration: string): number {
    const value = parseInt(duration.slice(0, -1), 10);
    const unit = duration.slice(-1);
    switch (unit) {
      case 's':
        return value * 1_000;
      case 'm':
        return value * 60 * 1_000;
      case 'h':
        return value * 60 * 60 * 1_000;
      case 'd':
        return value * 24 * 60 * 60 * 1_000;
      default:
        return 7 * 24 * 60 * 60 * 1_000;
    }
  }

  get refreshDurationMs(): number {
    return JwtTokenService.parseDurationMs(this.refreshExpiration);
  }
}
