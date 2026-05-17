import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { User } from '../../generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthRepository } from './auth.repository';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtTokenService } from './jwt-token.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const exists = await this.authRepository.emailExists(dto.email);
    if (exists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.authRepository.create({
      email: dto.email,
      password: hashed,
      name: dto.name,
      lastName: dto.lastName,
      phone: dto.phone,
    });

    const token = randomUUID();
    const exp = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.authRepository.saveVerificationToken(user.id, token, exp);
    await this.notificationsService.sendVerificationEmail(user.email, user.name, token);

    return { message: 'Revisá tu email para verificar tu cuenta' };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto & TokenPair> {
    const user = await this.authRepository.findByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta está inactiva');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException('Debés verificar tu email antes de iniciar sesión');
    }

    return this.buildTokenPair(user);
  }

  async session(refreshToken: string): Promise<AuthResponseDto> {
    const { user } = await this.resolveRefreshUser(refreshToken);

    const accessToken = await this.jwtTokenService.signAccess({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken, user: this.toUserDto(user) };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.authRepository.findByVerificationToken(token);

    if (!user || !user.verificationTokenExp || user.verificationTokenExp < new Date()) {
      throw new UnauthorizedException('El token de verificación es inválido o expiró');
    }

    await this.authRepository.markEmailVerified(user.id);

    return { message: 'Email verificado correctamente' };
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto & TokenPair> {
    const { user, jti } = await this.resolveRefreshUser(refreshToken);

    // Rotación: eliminar token anterior y emitir uno nuevo
    await this.authRepository.deleteRefreshToken(jti);
    return this.buildTokenPair(user);
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.jwtTokenService.verifyRefresh(refreshToken);
      await this.authRepository.deleteRefreshToken(payload.jti);
    } catch {
      // Si el token ya es inválido, no hacemos nada
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      // Anti-enumeration: silently return without indicating whether email exists
      return;
    }

    const token = randomUUID();
    const exp = new Date(Date.now() + 3_600_000); // 1 hour
    await this.authRepository.saveResetToken(user.id, token, exp);
    await this.notificationsService.sendPasswordResetEmail(user.email, user.name, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.authRepository.findUserByResetToken(token);

    if (!user) {
      throw new UnauthorizedException('El token de restablecimiento es inválido o expiró');
    }

    if (!user.resetTokenExp || user.resetTokenExp <= new Date()) {
      throw new UnauthorizedException('El token de restablecimiento es inválido o expiró');
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await this.authRepository.resetPasswordAtomic(user.id, hashed);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async resolveRefreshUser(refreshToken: string): Promise<{ user: User, jti: string }> {
    let payload: { sub: string; jti: string };

    try {
      payload = await this.jwtTokenService.verifyRefresh(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const stored = await this.authRepository.findRefreshToken(payload.jti);
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token revocado o expirado');
    }

    const user = await this.authRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    return { user, jti: payload.jti };
  }

  private async buildTokenPair(
    user: User,
  ): Promise<AuthResponseDto & TokenPair> {
    const jti = randomUUID();
    const expiresAt = new Date(
      Date.now() + this.jwtTokenService.refreshDurationMs,
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtTokenService.signAccess({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      this.jwtTokenService.signRefresh(user.id, jti),
    ]);

    await this.authRepository.createRefreshToken({
      id: jti,
      userId: user.id,
      expiresAt,
    });

    return { accessToken, refreshToken, user: this.toUserDto(user) };
  }

  private toUserDto(user: User): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }
}
