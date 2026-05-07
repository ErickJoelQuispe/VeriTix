import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Role } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResponse } from '@common/dto';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ChangePasswordDto,
  UpdateProfileDto,
  UserQueryDto,
  UserResponseDto,
} from './dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user as UserResponseDto;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    if (dto.phone) {
      const existing = await this.usersRepository.findByPhone(dto.phone);
      if (existing && existing.id !== userId) {
        throw new ConflictException('El teléfono ya está registrado');
      }
    }
    const updated = await this.usersRepository.update(userId, dto);
    return updated as UserResponseDto;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch)
      throw new UnauthorizedException('La contraseña actual es incorrecta');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.usersRepository.update(userId, { password: hashedPassword });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async findAll(
    query: UserQueryDto,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    return this.usersRepository.findAll({
      page: query.page,
      limit: query.limit,
      role: query.role,
      isActive: query.isActive,
      search: query.search,
    }) as Promise<PaginatedResponse<UserResponseDto>>;
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user as UserResponseDto;
  }

  async create(dto: AdminCreateUserDto): Promise<UserResponseDto> {
    const existingEmail = await this.usersRepository.findByEmail(dto.email);
    if (existingEmail)
      throw new ConflictException('El correo electrónico ya está registrado');

    const existingPhone = await this.usersRepository.findByPhone(dto.phone);
    if (existingPhone)
      throw new ConflictException('El teléfono ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const created = await this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });
    return created as UserResponseDto;
  }

  async update(
    id: string,
    dto: AdminUpdateUserDto,
    adminId: string,
  ): Promise<UserResponseDto> {
    const current = await this.usersRepository.findById(id);
    if (!current) throw new NotFoundException('Usuario no encontrado');

    if (dto.email && dto.email !== current.email) {
      const existingEmail = await this.usersRepository.findByEmail(dto.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    if (dto.phone && dto.phone !== current.phone) {
      const existingPhone = await this.usersRepository.findByPhone(dto.phone);
      if (existingPhone && existingPhone.id !== id) {
        throw new ConflictException('El teléfono ya está registrado');
      }
    }

    if (
      current.role === Role.ADMIN &&
      dto.role !== undefined &&
      dto.role !== Role.ADMIN
    ) {
      const adminCount = await this.usersRepository.countByRole(Role.ADMIN);
      if (adminCount <= 1) {
        throw new ConflictException(
          'No se puede cambiar el rol del último administrador',
        );
      }
    }

    if (current.role === Role.ADMIN && dto.isActive === false) {
      const adminCount = await this.usersRepository.countByRole(Role.ADMIN);
      if (adminCount <= 1) {
        throw new ConflictException(
          'No se puede desactivar al último administrador',
        );
      }
    }

    const updated = await this.usersRepository.update(id, dto);
    return updated as UserResponseDto;
  }

  async remove(id: string, adminId: string): Promise<void> {
    if (id === adminId) {
      throw new ForbiddenException('No puedes eliminarte a ti mismo');
    }

    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role === Role.ADMIN) {
      const adminCount = await this.usersRepository.countByRole(Role.ADMIN);
      if (adminCount <= 1) {
        throw new ConflictException(
          'No se puede eliminar al último administrador',
        );
      }
    }

    await this.usersRepository.softDelete(id);
  }
}
