import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { jwtVerify } from 'jose';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * OptionalJwtAuthGuard — attempts to verify the JWT but does NOT fail if
 * no token is present or if the token is invalid. If a valid token is found,
 * it sets `request.user`. Otherwise `request.user` remains undefined.
 *
 * Uses ConfigService directly (globally available) to avoid DI cycles with
 * JwtTokenService when registered alongside APP_GUARD providers.
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  private readonly accessSecret: Uint8Array;
  private readonly issuer: string;

  constructor(private readonly config: ConfigService) {
    this.accessSecret = new TextEncoder().encode(
      config.getOrThrow<string>('JWT_SECRET'),
    );
    this.issuer = config.get<string>('JWT_ISSUER', 'veritix-api')!;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      return true; // unauthenticated — proceed without user
    }

    try {
      const { payload } = await jwtVerify(token, this.accessSecret, {
        issuer: this.issuer,
        algorithms: ['HS256'],
      });

      const user: JwtPayload = {
        sub: payload.sub as string,
        email: payload['email'] as string,
        role: payload['role'] as JwtPayload['role'],
        iat: payload.iat,
        exp: payload.exp,
      };

      (request as unknown as Record<string, unknown>)['user'] = user;
    } catch {
      // Invalid / expired token — silently ignore, treat as anonymous
    }

    return true;
  }

  private extractBearerToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
