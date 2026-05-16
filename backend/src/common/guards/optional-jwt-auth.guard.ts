import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenService } from '../../modules/auth/jwt-token.service';

/**
 * OptionalJwtAuthGuard — attempts to verify the JWT but does NOT fail if
 * no token is present. If a valid token is found, it sets `request.user`.
 * If no token or an invalid token is found, `request.user` remains undefined.
 *
 * Use this for routes that behave differently for authenticated vs. anonymous
 * callers without requiring authentication.
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      return true; // unauthenticated — proceed without user
    }

    try {
      const payload = await this.jwtTokenService.verifyAccess(token);
      (request as unknown as Record<string, unknown>)['user'] = payload;
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
