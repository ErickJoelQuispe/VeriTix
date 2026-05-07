import { Injectable } from '@nestjs/common';
import { PaginatedResponse, createPaginatedResponse } from '@common/dto';
import { User } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';
import type {
  UserGetPayload,
  UserWhereInput,
} from '../../generated/prisma/models';
import { PrismaService } from '../../prisma/prisma.service';

export const USER_SELECT = {
  id: true,
  email: true,
  phone: true,
  name: true,
  lastName: true,
  role: true,
  avatarUrl: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type UserSafe = UserGetPayload<{ select: typeof USER_SELECT }>;

export type CreateUserData = {
  email: string;
  phone: string;
  name: string;
  lastName: string;
  password: string;
  role?: Role;
};

export type UpdateUserData = Partial<{
  name: string;
  lastName: string;
  phone: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  isActive: boolean;
  emailVerified: boolean;
  password: string;
}>;

export type FindAllParams = {
  page: number;
  limit: number;
  role?: Role;
  isActive?: boolean;
  search?: string;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  async findAll(params: FindAllParams): Promise<PaginatedResponse<UserSafe>> {
    const { page, limit, role, isActive, search } = params;

    const where: UserWhereInput = {};

    if (role !== undefined) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  findById(id: string): Promise<UserSafe | null> {
    return this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  }

  /** Returns the full User including password — use only for credential verification. */
  findByIdWithPassword(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<UserSafe | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: USER_SELECT,
    });
  }

  findByPhone(phone: string): Promise<UserSafe | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      select: USER_SELECT,
    });
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  create(data: CreateUserData): Promise<UserSafe> {
    return this.prisma.user.create({ data, select: USER_SELECT });
  }

  update(id: string, data: UpdateUserData): Promise<UserSafe> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  softDelete(id: string): Promise<UserSafe> {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: USER_SELECT,
    });
  }

  // ── Aggregates ────────────────────────────────────────────────────────────

  countByRole(role: Role): Promise<number> {
    return this.prisma.user.count({ where: { role } });
  }
}
