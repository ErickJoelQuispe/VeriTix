import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../cache';
import { ArtistQueryDto, CreateArtistDto, UpdateArtistDto } from './dto';
import { ArtistsRepository } from './artists.repository';
import { ArtistsService } from './artists.service';

const mockCacheService = {
  getOrSet: jest.fn((_k: string, fn: () => any) => fn()),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

// ── Mock data ────────────────────────────────────────────────────────────────

const mockArtistSafe = {
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

// ── Suite ────────────────────────────────────────────────────────────────────

describe('ArtistsService', () => {
  let service: ArtistsService;
  let repo: jest.Mocked<ArtistsRepository>;

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
        ArtistsService,
        { provide: ArtistsRepository, useValue: mockRepo },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<ArtistsService>(ArtistsService);
    repo = module.get(ArtistsRepository) as jest.Mocked<ArtistsRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create an artist when slug is unique', async () => {
      const dto: CreateArtistDto = {
        name: 'The Rolling Stones',
        slug: 'the-rolling-stones',
        country: 'GB',
        genreIds: ['genre-1'],
      };
      repo.findBySlug.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockArtistSafe);

      const result = await service.create(dto);

      expect(repo.findBySlug).toHaveBeenCalledWith('the-rolling-stones');
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockArtistSafe);
    });

    it('should throw ConflictException when slug already exists', async () => {
      const dto: CreateArtistDto = {
        name: 'Otro artista',
        slug: 'the-rolling-stones',
      };
      repo.findBySlug.mockResolvedValue(mockArtistSafe);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should delegate to repository and return paginated response', async () => {
      const query: ArtistQueryDto = { page: 1, limit: 10 };
      const paginated = {
        data: [mockArtistSafe],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      repo.findAll.mockResolvedValue(paginated as any);

      const result = await service.findAll(query);

      expect(result).toEqual(paginated);
      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        genreId: undefined,
        country: undefined,
        isActive: undefined,
        search: undefined,
      });
    });

    it('should pass filters to repository', async () => {
      const query: ArtistQueryDto = {
        page: 1,
        limit: 5,
        genreId: 'genre-1',
        country: 'GB',
        isActive: true,
        search: 'Rolling',
      };
      const paginated = {
        data: [mockArtistSafe],
        meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
      };
      repo.findAll.mockResolvedValue(paginated as any);

      await service.findAll(query);

      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 5,
        genreId: 'genre-1',
        country: 'GB',
        isActive: true,
        search: 'Rolling',
      });
    });
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return the artist when found', async () => {
      repo.findById.mockResolvedValue(mockArtistSafe);

      const result = await service.findOne('uuid-artist-1');

      expect(result).toEqual(mockArtistSafe);
      expect(repo.findById).toHaveBeenCalledWith('uuid-artist-1');
    });

    it('should throw NotFoundException when artist does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update() ─────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('should update artist fields', async () => {
      const dto: UpdateArtistDto = { name: 'The Rolling Stones (Remastered)' };
      const updated = {
        ...mockArtistSafe,
        name: 'The Rolling Stones (Remastered)',
      };
      repo.findById.mockResolvedValue(mockArtistSafe);
      repo.update.mockResolvedValue(updated);

      const result = await service.update('uuid-artist-1', dto);

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith('uuid-artist-1', dto);
      expect(repo.findBySlug).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when artist does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update('uuid-not-found', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should check slug uniqueness when slug is changed', async () => {
      const dto: UpdateArtistDto = { slug: 'nuevo-slug' };
      repo.findById.mockResolvedValue(mockArtistSafe); // current slug: 'the-rolling-stones'
      repo.findBySlug.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockArtistSafe, slug: 'nuevo-slug' });

      await service.update('uuid-artist-1', dto);

      expect(repo.findBySlug).toHaveBeenCalledWith('nuevo-slug');
      expect(repo.update).toHaveBeenCalledWith('uuid-artist-1', dto);
    });

    it('should throw ConflictException when new slug is taken by another artist', async () => {
      const dto: UpdateArtistDto = { slug: 'slug-tomado' };
      repo.findById.mockResolvedValue(mockArtistSafe); // id: 'uuid-artist-1'
      repo.findBySlug.mockResolvedValue({
        ...mockArtistSafe,
        id: 'uuid-artist-2',
        slug: 'slug-tomado',
      });

      await expect(service.update('uuid-artist-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should allow update when slug belongs to the same artist', async () => {
      const dto: UpdateArtistDto = { slug: 'the-rolling-stones' };
      repo.findById.mockResolvedValue(mockArtistSafe); // current slug: 'the-rolling-stones', id: 'uuid-artist-1'
      repo.findBySlug.mockResolvedValue(mockArtistSafe); // returns same artist
      repo.update.mockResolvedValue(mockArtistSafe);

      const result = await service.update('uuid-artist-1', dto);

      expect(result).toEqual(mockArtistSafe);
      expect(repo.update).toHaveBeenCalledWith('uuid-artist-1', dto);
    });

    it('should update genres when genreIds is provided', async () => {
      const dto: UpdateArtistDto = { genreIds: ['genre-1', 'genre-2'] };
      const updated = {
        ...mockArtistSafe,
        genres: [
          { id: 'genre-1', name: 'Rock', slug: 'rock' },
          { id: 'genre-2', name: 'Blues', slug: 'blues' },
        ],
      };
      repo.findById.mockResolvedValue(mockArtistSafe);
      repo.update.mockResolvedValue(updated);

      const result = await service.update('uuid-artist-1', dto);

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith('uuid-artist-1', dto);
    });
  });

  // ── remove() ─────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should throw NotFoundException when artist does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.softDelete).not.toHaveBeenCalled();
    });

    it('should soft-delete the artist', async () => {
      repo.findById.mockResolvedValue(mockArtistSafe);
      repo.softDelete.mockResolvedValue({ ...mockArtistSafe, isActive: false });

      await service.remove('uuid-artist-1');

      expect(repo.softDelete).toHaveBeenCalledWith('uuid-artist-1');
    });
  });
});
