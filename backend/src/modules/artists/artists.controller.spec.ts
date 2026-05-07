import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../generated/prisma/enums';
import { ArtistQueryDto, CreateArtistDto, UpdateArtistDto } from './dto';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';

const mockAdminUser: JwtPayload = {
  sub: 'uuid-admin',
  email: 'admin@test.com',
  role: Role.ADMIN,
};

const mockArtistResponse = {
  id: 'uuid-artist-1',
  name: 'The Rolling Stones',
  slug: 'the-rolling-stones',
  bio: 'Banda de rock británica formada en 1962.',
  imageUrl: null,
  country: 'GB',
  website: 'https://www.rollingstones.com',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  genres: [{ id: 'genre-1', name: 'Rock', slug: 'rock' }],
};

const mockArtistsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ArtistsController', () => {
  let controller: ArtistsController;
  let service: typeof mockArtistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        {
          provide: ArtistsService,
          useValue: mockArtistsService,
        },
      ],
    }).compile();

    controller = module.get<ArtistsController>(ArtistsController);
    service = module.get(ArtistsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call create with dto and return the created artist', async () => {
      const dto: CreateArtistDto = {
        name: 'The Rolling Stones',
        slug: 'the-rolling-stones',
        country: 'GB',
        genreIds: ['genre-1'],
      };
      service.create.mockResolvedValue(mockArtistResponse);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockArtistResponse);
    });
  });

  describe('findAll', () => {
    it('should call findAll with query params and return paginated result', async () => {
      const query: ArtistQueryDto = { page: 1, limit: 10 };
      const paginated = {
        data: [mockArtistResponse],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginated);
    });
  });

  describe('findOne', () => {
    it('should call findOne with id and return the result', async () => {
      service.findOne.mockResolvedValue(mockArtistResponse);

      const result = await controller.findOne('uuid-artist-1');

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith('uuid-artist-1');
      expect(result).toEqual(mockArtistResponse);
    });
  });

  describe('update', () => {
    it('should call update with id and dto, then return the result', async () => {
      const id = 'uuid-artist-1';
      const dto: UpdateArtistDto = { name: 'The Rolling Stones Renovado' };
      const updated = {
        ...mockArtistResponse,
        name: 'The Rolling Stones Renovado',
      };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should call remove with id and return void', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('uuid-artist-1');

      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(service.remove).toHaveBeenCalledWith('uuid-artist-1');
    });
  });
});
