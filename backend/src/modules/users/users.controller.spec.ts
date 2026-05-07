import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../generated/prisma/enums';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ChangePasswordDto,
  UpdateProfileDto,
  UserQueryDto,
} from './dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUser: JwtPayload = {
  sub: 'uuid-1',
  email: 'test@test.com',
  role: Role.BUYER,
};

const mockAdminUser: JwtPayload = {
  sub: 'uuid-admin',
  email: 'admin@test.com',
  role: Role.ADMIN,
};

const mockUserResponse = {
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

const mockUsersService = {
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);

    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should call getProfile with user.sub and return the result', async () => {
      service.getProfile.mockResolvedValue(mockUserResponse);

      const result = await controller.getMe(mockUser);

      expect(service.getProfile).toHaveBeenCalledTimes(1);
      expect(service.getProfile).toHaveBeenCalledWith(mockUser.sub);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('updateMe', () => {
    it('should call updateProfile with user.sub and dto, then return the result', async () => {
      const dto: UpdateProfileDto = { name: 'Updated' };
      const updated = { ...mockUserResponse, name: 'Updated' };
      service.updateProfile.mockResolvedValue(updated);

      const result = await controller.updateMe(mockUser, dto);

      expect(service.updateProfile).toHaveBeenCalledTimes(1);
      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.sub, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('changePassword', () => {
    it('should call changePassword on service and return the success message', async () => {
      const dto: ChangePasswordDto = {
        currentPassword: 'oldPass123!',
        newPassword: 'newPass456!',
      };
      service.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(mockUser, dto);

      expect(service.changePassword).toHaveBeenCalledTimes(1);
      expect(service.changePassword).toHaveBeenCalledWith(mockUser.sub, dto);
      expect(result).toEqual({
        message: 'Contraseña actualizada exitosamente',
      });
    });
  });

  describe('findAll', () => {
    it('should call findAll with query params and return paginated result', async () => {
      const query: UserQueryDto = { page: 1, limit: 10 };
      const paginated = {
        data: [mockUserResponse],
        total: 1,
        page: 1,
        limit: 10,
      };
      service.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginated);
    });
  });

  describe('findById', () => {
    it('should call findById with the given id and return the result', async () => {
      service.findById.mockResolvedValue(mockUserResponse);

      const result = await controller.findById('uuid-1');

      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(service.findById).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('create', () => {
    it('should call create with dto and return the created user', async () => {
      const dto: AdminCreateUserDto = {
        email: 'new@test.com',
        phone: '+525512345679',
        name: 'New',
        lastName: 'User',
        password: 'Pass123!',
        role: Role.BUYER,
      };
      service.create.mockResolvedValue({ ...mockUserResponse, ...dto });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toMatchObject({ email: dto.email });
    });
  });

  describe('update', () => {
    it('should call update with id, dto, and adminId (user.sub)', async () => {
      const id = 'uuid-1';
      const dto: AdminUpdateUserDto = { name: 'Renamed' };
      const updated = { ...mockUserResponse, name: 'Renamed' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(id, dto, mockAdminUser);

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(id, dto, mockAdminUser.sub);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call remove with id and adminId (user.sub)', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('uuid-1', mockAdminUser);

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith('uuid-1', mockAdminUser.sub);
    });
  });
});
