import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Role } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ChangePasswordDto,
  UpdateProfileDto,
  UserQueryDto,
} from './dto';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('new-hash'),
  compare: jest.fn(),
}));

// ── Mock data ────────────────────────────────────────────────────────────────

const mockUserSafe = {
  id: 'uuid-1',
  email: 'test@test.com',
  phone: '+525512345678',
  name: 'Test',
  lastName: 'User',
  role: Role.BUYER,
  avatarUrl: null,
  isActive: true,
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserWithPassword = {
  ...mockUserSafe,
  password: 'hashed-password',
  resetToken: null,
  resetTokenExp: null,
};

const mockAdminSafe = {
  ...mockUserSafe,
  id: 'uuid-admin',
  email: 'admin@test.com',
  role: Role.ADMIN,
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<UsersRepository>;
  let prisma: { refreshToken: { deleteMany: jest.Mock } };

  beforeEach(async () => {
    const mockRepo = {
      findById: jest.fn(),
      findByIdWithPassword: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      countByRole: jest.fn(),
    };

    const mockPrisma = {
      refreshToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(UsersRepository) as jest.Mocked<UsersRepository>;
    prisma = module.get(PrismaService) as unknown as typeof mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── getProfile() ──────────────────────────────────────────────────────────

  describe('getProfile()', () => {
    it('should return the user profile', async () => {
      repo.findById.mockResolvedValue(mockUserSafe);

      const result = await service.getProfile('uuid-1');

      expect(result).toEqual(mockUserSafe);
      expect(repo.findById).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.getProfile('uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── updateProfile() ───────────────────────────────────────────────────────

  describe('updateProfile()', () => {
    it('should update profile fields without phone check', async () => {
      const dto: UpdateProfileDto = { name: 'Updated' };
      const updated = { ...mockUserSafe, name: 'Updated' };
      repo.update.mockResolvedValue(updated);

      const result = await service.updateProfile('uuid-1', dto);

      expect(result).toEqual(updated);
      expect(repo.findByPhone).not.toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith('uuid-1', dto);
    });

    it('should throw ConflictException when phone belongs to a different user', async () => {
      const dto: UpdateProfileDto = { phone: '+525599999999' };
      repo.findByPhone.mockResolvedValue({
        ...mockUserSafe,
        id: 'uuid-other',
        phone: '+525599999999',
      });

      await expect(service.updateProfile('uuid-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should allow update when phone belongs to the same user', async () => {
      const dto: UpdateProfileDto = { phone: '+525512345678' };
      repo.findByPhone.mockResolvedValue(mockUserSafe); // id: 'uuid-1' === userId
      repo.update.mockResolvedValue(mockUserSafe);

      const result = await service.updateProfile('uuid-1', dto);

      expect(result).toEqual(mockUserSafe);
      expect(repo.update).toHaveBeenCalledWith('uuid-1', dto);
    });
  });

  // ── changePassword() ──────────────────────────────────────────────────────

  describe('changePassword()', () => {
    it('should hash new password and invalidate refresh tokens on success', async () => {
      const dto: ChangePasswordDto = {
        currentPassword: 'OldPass1',
        newPassword: 'NewPass1',
      };
      repo.findByIdWithPassword.mockResolvedValue(mockUserWithPassword as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      repo.update.mockResolvedValue(mockUserSafe);

      await service.changePassword('uuid-1', dto);

      expect(repo.findByIdWithPassword).toHaveBeenCalledWith('uuid-1');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'OldPass1',
        'hashed-password',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass1', 12);
      expect(repo.update).toHaveBeenCalledWith('uuid-1', {
        password: 'new-hash',
      });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'uuid-1' },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findByIdWithPassword.mockResolvedValue(null);

      await expect(
        service.changePassword('uuid-1', {
          currentPassword: 'Old1',
          newPassword: 'New1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when current password is wrong', async () => {
      repo.findByIdWithPassword.mockResolvedValue(mockUserWithPassword as any);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.changePassword('uuid-1', {
          currentPassword: 'WrongPass1',
          newPassword: 'NewPass1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should delegate to repository and return paginated response', async () => {
      const query: UserQueryDto = { page: 1, limit: 10 };
      const paginated = {
        data: [mockUserSafe],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      repo.findAll.mockResolvedValue(paginated as any);

      const result = await service.findAll(query);

      expect(result).toEqual(paginated);
      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        role: undefined,
        isActive: undefined,
        search: undefined,
      });
    });
  });

  // ── findById() [admin] ────────────────────────────────────────────────────

  describe('findById()', () => {
    it('should return the user', async () => {
      repo.findById.mockResolvedValue(mockUserSafe);

      const result = await service.findById('uuid-1');

      expect(result).toEqual(mockUserSafe);
      expect(repo.findById).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should hash password and create the user', async () => {
      const dto: AdminCreateUserDto = {
        email: 'new@test.com',
        phone: '+525511111111',
        name: 'New',
        lastName: 'User',
        password: 'Password1',
        role: Role.BUYER,
      };
      repo.findByEmail.mockResolvedValue(null);
      repo.findByPhone.mockResolvedValue(null);
      repo.create.mockResolvedValue({ ...mockUserSafe, email: 'new@test.com' });

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 12);
      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        password: 'new-hash',
      });
      expect(result.email).toBe('new@test.com');
    });

    it('should throw ConflictException for duplicate email', async () => {
      const dto: AdminCreateUserDto = {
        email: 'test@test.com',
        phone: '+525511111111',
        name: 'New',
        lastName: 'User',
        password: 'Password1',
      };
      repo.findByEmail.mockResolvedValue(mockUserSafe);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repo.findByPhone).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate phone', async () => {
      const dto: AdminCreateUserDto = {
        email: 'new@test.com',
        phone: '+525512345678',
        name: 'New',
        lastName: 'User',
        password: 'Password1',
      };
      repo.findByEmail.mockResolvedValue(null);
      repo.findByPhone.mockResolvedValue(mockUserSafe);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ── update() [admin] ─────────────────────────────────────────────────────

  describe('update()', () => {
    it('should update user fields', async () => {
      const dto: AdminUpdateUserDto = { name: 'Updated Name' };
      const updated = { ...mockUserSafe, name: 'Updated Name' };
      repo.findById.mockResolvedValue(mockUserSafe);
      repo.update.mockResolvedValue(updated);

      const result = await service.update('uuid-1', dto, 'uuid-admin');

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith('uuid-1', dto);
      expect(repo.countByRole).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update('uuid-1', {}, 'uuid-admin')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      const dto: AdminUpdateUserDto = { email: 'other@test.com' };
      repo.findById.mockResolvedValue(mockUserSafe); // current email: 'test@test.com'
      repo.findByEmail.mockResolvedValue({
        ...mockUserSafe,
        id: 'uuid-other',
        email: 'other@test.com',
      });

      await expect(service.update('uuid-1', dto, 'uuid-admin')).rejects.toThrow(
        ConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when removing role from last admin', async () => {
      const dto: AdminUpdateUserDto = { role: Role.BUYER };
      repo.findById.mockResolvedValue(mockAdminSafe);
      repo.countByRole.mockResolvedValue(1);

      await expect(
        service.update('uuid-admin', dto, 'uuid-superadmin'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when deactivating the last admin', async () => {
      const dto: AdminUpdateUserDto = { isActive: false };
      repo.findById.mockResolvedValue(mockAdminSafe);
      repo.countByRole.mockResolvedValue(1);

      await expect(
        service.update('uuid-admin', dto, 'uuid-superadmin'),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── remove() ─────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should throw ForbiddenException when admin tries to delete themselves', async () => {
      await expect(service.remove('uuid-admin', 'uuid-admin')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('uuid-1', 'uuid-admin')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when trying to delete the last admin', async () => {
      repo.findById.mockResolvedValue(mockAdminSafe);
      repo.countByRole.mockResolvedValue(1);

      await expect(
        service.remove('uuid-admin', 'uuid-superadmin'),
      ).rejects.toThrow(ConflictException);
      expect(repo.softDelete).not.toHaveBeenCalled();
    });

    it('should soft-delete the user', async () => {
      repo.findById.mockResolvedValue(mockUserSafe); // BUYER — no admin check
      repo.softDelete.mockResolvedValue({ ...mockUserSafe, isActive: false });

      await service.remove('uuid-1', 'uuid-admin');

      expect(repo.softDelete).toHaveBeenCalledWith('uuid-1');
    });
  });
});
