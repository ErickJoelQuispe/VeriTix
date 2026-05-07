import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../cache';
import { VenueType } from '../../generated/prisma/enums';
import { CreateVenueDto, UpdateVenueDto, VenueQueryDto } from './dto';
import { VenuesRepository } from './venues.repository';
import { VenuesService } from './venues.service';

const mockCacheService = {
  getOrSet: jest.fn((_k: string, fn: () => any) => fn()),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

// ── Mock data ────────────────────────────────────────────────────────────────

const mockVenueSafe = {
  id: 'uuid-venue-1',
  name: 'Foro Sol',
  slug: 'foro-sol',
  address: 'Av. Viaducto Río de la Piedad s/n',
  city: 'Ciudad de México',
  state: 'CDMX',
  country: 'MX',
  capacity: 65000,
  type: VenueType.FORO,
  isActive: true,
  imageUrl: null,
  website: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('VenuesService', () => {
  let service: VenuesService;
  let repo: jest.Mocked<VenuesRepository>;

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenuesService,
        { provide: VenuesRepository, useValue: mockRepo },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<VenuesService>(VenuesService);
    repo = module.get(VenuesRepository) as jest.Mocked<VenuesRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create a venue when slug is unique', async () => {
      const dto: CreateVenueDto = {
        name: 'Foro Sol',
        slug: 'foro-sol',
        address: 'Av. Viaducto Río de la Piedad s/n',
        city: 'Ciudad de México',
      };
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockVenueSafe);

      const result = await service.create(dto);

      expect(repo.findBySlug).toHaveBeenCalledWith('foro-sol');
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockVenueSafe);
    });

    it('should throw ConflictException when slug already exists', async () => {
      const dto: CreateVenueDto = {
        name: 'Otro Foro',
        slug: 'foro-sol',
        address: 'Otra dirección',
        city: 'Guadalajara',
      };
      repo.findBySlug.mockResolvedValue(mockVenueSafe);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should delegate to repository and return paginated response', async () => {
      const query: VenueQueryDto = { page: 1, limit: 10 };
      const paginated = {
        data: [mockVenueSafe],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      repo.findAll.mockResolvedValue(paginated as any);

      const result = await service.findAll(query);

      expect(result).toEqual(paginated);
      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        city: undefined,
        type: undefined,
        isActive: undefined,
        search: undefined,
      });
    });

    it('should pass filters to repository', async () => {
      const query: VenueQueryDto = {
        page: 1,
        limit: 5,
        city: 'Ciudad de México',
        type: VenueType.FORO,
        isActive: true,
        search: 'Foro',
      };
      const paginated = {
        data: [mockVenueSafe],
        meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
      };
      repo.findAll.mockResolvedValue(paginated as any);

      await service.findAll(query);

      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 5,
        city: 'Ciudad de México',
        type: VenueType.FORO,
        isActive: true,
        search: 'Foro',
      });
    });
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return the venue when found', async () => {
      repo.findById.mockResolvedValue(mockVenueSafe);

      const result = await service.findOne('uuid-venue-1');

      expect(result).toEqual(mockVenueSafe);
      expect(repo.findById).toHaveBeenCalledWith('uuid-venue-1');
    });

    it('should throw NotFoundException when venue does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update() ─────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('should update venue fields', async () => {
      const dto: UpdateVenueDto = { name: 'Foro Sol Renovado' };
      const updated = { ...mockVenueSafe, name: 'Foro Sol Renovado' };
      repo.findById.mockResolvedValue(mockVenueSafe);
      repo.update.mockResolvedValue(updated);

      const result = await service.update('uuid-venue-1', dto);

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith('uuid-venue-1', dto);
      expect(repo.findBySlug).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when venue does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update('uuid-not-found', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should check slug uniqueness when slug is changed', async () => {
      const dto: UpdateVenueDto = { slug: 'nuevo-slug' };
      repo.findById.mockResolvedValue(mockVenueSafe); // current slug: 'foro-sol'
      repo.findBySlug.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockVenueSafe, slug: 'nuevo-slug' });

      await service.update('uuid-venue-1', dto);

      expect(repo.findBySlug).toHaveBeenCalledWith('nuevo-slug');
      expect(repo.update).toHaveBeenCalledWith('uuid-venue-1', dto);
    });

    it('should throw ConflictException when new slug is taken by another venue', async () => {
      const dto: UpdateVenueDto = { slug: 'slug-tomado' };
      repo.findById.mockResolvedValue(mockVenueSafe); // id: 'uuid-venue-1'
      repo.findBySlug.mockResolvedValue({
        ...mockVenueSafe,
        id: 'uuid-venue-2',
        slug: 'slug-tomado',
      });

      await expect(service.update('uuid-venue-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should allow update when slug belongs to the same venue', async () => {
      const dto: UpdateVenueDto = { slug: 'foro-sol' };
      repo.findById.mockResolvedValue(mockVenueSafe); // current slug: 'foro-sol', id: 'uuid-venue-1'
      repo.findBySlug.mockResolvedValue(mockVenueSafe); // returns same venue
      repo.update.mockResolvedValue(mockVenueSafe);

      const result = await service.update('uuid-venue-1', dto);

      expect(result).toEqual(mockVenueSafe);
      expect(repo.update).toHaveBeenCalledWith('uuid-venue-1', dto);
    });
  });

  // ── remove() ─────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should throw NotFoundException when venue does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.softDelete).not.toHaveBeenCalled();
    });

    it('should soft-delete the venue', async () => {
      repo.findById.mockResolvedValue(mockVenueSafe);
      repo.softDelete.mockResolvedValue({ ...mockVenueSafe, isActive: false });

      await service.remove('uuid-venue-1');

      expect(repo.softDelete).toHaveBeenCalledWith('uuid-venue-1');
    });
  });
});
