import { Injectable } from '@nestjs/common';
import { RefreshToken, User } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

export type CreateUserData = {
  email: string;
  password: string;
  name: string;
  lastName: string;
  phone: string;
};

export type CreateRefreshTokenData = {
  id: string;
  userId: string;
  expiresAt: Date;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Usuario ──────────────────────────────────────────────────────────────

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        lastName: data.lastName,
        phone: data.phone,
        role: Role.BUYER,
      },
    });
  }

  // ── Refresh Token ─────────────────────────────────────────────────────────

  createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  findRefreshToken(jti: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { id: jti } });
  }

  deleteRefreshToken(jti: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.delete({ where: { id: jti } });
  }

  deleteAllUserRefreshTokens(userId: string): Promise<{ count: number }> {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  // ── Verificación de email ─────────────────────────────────────────────────

  saveVerificationToken(userId: string, token: string, exp: Date): Promise<void> {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { verificationToken: token, verificationTokenExp: exp },
      })
      .then(() => undefined);
  }

  findByVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { verificationToken: token } });
  }

  markEmailVerified(userId: string): Promise<void> {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationTokenExp: null,
        },
      })
      .then(() => undefined);
  }

  updatePassword(userId: string, hashed: string): Promise<void> {
    return this.prisma.user
      .update({ where: { id: userId }, data: { password: hashed } })
      .then(() => undefined);
  }

  // ── Reset de contraseña ───────────────────────────────────────────────────

  saveResetToken(userId: string, token: string, exp: Date): Promise<void> {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { resetToken: token, resetTokenExp: exp },
      })
      .then(() => undefined);
  }

  findUserByResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { resetToken: token } });
  }

  clearResetToken(userId: string): Promise<void> {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { resetToken: null, resetTokenExp: null },
      })
      .then(() => undefined);
  }

  async resetPasswordAtomic(userId: string, hashedPassword: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword, resetToken: null, resetTokenExp: null },
      }),
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
    ]);
  }
}
