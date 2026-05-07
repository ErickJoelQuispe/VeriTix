import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../cache';
import { CreateGenreDto, UpdateGenreDto } from './dto';
import { GenresRepository } from './genres.repository';
import { GenresService } from './genres.service';

const mockCacheService = {
  getOrSet: jest.fn((_k: string, fn: () => any) => fn()),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

// ── Mock data ────────────────────────────────────────────────────────────────

const mockGenre = {
  id: 'uuid-genre-1',
  name: 'Rock',
  slug: 'rock',
  description:
    'Género musical caracterizado por el uso de guitarras eléctricas.',
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('GenresService', () => {
  let service: GenresService;
  let repo: jest.Mocked<GenresRepository>;

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: GenresRepository, useValue: mockRepo },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
    repo = module.get(GenresRepository) as jest.Mocked<GenresRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create a genre when slug and name are unique', async () => {
      const dto: CreateGenreDto = {
        name: 'Rock',
        slug: 'rock',
        description:
          'Género musical caracterizado por el uso de guitarras eléctricas.',
      };
      repo.findBySlug.mockResolvedValue(null);
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockGenre);

      const result = await service.create(dto);

      expect(repo.findBySlug).toHaveBeenCalledWith('rock');
      expect(repo.findByName).toHaveBeenCalledWith('Rock');
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockGenre);
    });

    it('should throw ConflictException when slug already exists', async () => {
      const dto: CreateGenreDto = {
        name: 'Rock Alternativo',
        slug: 'rock',
      };
      repo.findBySlug.mockResolvedValue(mockGenre);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repo.findByName).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when name already exists', async () => {
      const dto: CreateGenreDto = {
        name: 'Rock',
        slug: 'rock-nuevo',
      };
      repo.findBySlug.mockResolvedValue(null);
      repo.findByName.mockResolvedValue(mockGenre);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should return the full list of genres', async () => {
      const genres = [
        mockGenre,
        { ...mockGenre, id: 'uuid-genre-2', name: 'Pop', slug: 'pop' },
      ];
      repo.findAll.mockResolvedValue(genres);

      const result = await service.findAll();

      expect(repo.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(genres);
    });

    it('should return an empty array when there are no genres', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return the genre when found', async () => {
      repo.findById.mockResolvedValue(mockGenre);

      const result = await service.findOne('uuid-genre-1');

      expect(result).toEqual(mockGenre);
      expect(repo.findById).toHaveBeenCalledWith('uuid-genre-1');
    });

    it('should throw NotFoundException when genre does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update() ─────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('should update genre fields', async () => {
      const dto: UpdateGenreDto = { description: 'Nueva descripción' };
      const updated = { ...mockGenre, description: 'Nueva descripción' };
      repo.findById.mockResolvedValue(mockGenre);
      repo.update.mockResolvedValue(updated);

      const result = await service.update('uuid-genre-1', dto);

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith('uuid-genre-1', dto);
      expect(repo.findBySlug).not.toHaveBeenCalled();
      expect(repo.findByName).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when genre does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update('uuid-not-found', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should check slug uniqueness when slug is changed', async () => {
      const dto: UpdateGenreDto = { slug: 'rock-nuevo' };
      repo.findById.mockResolvedValue(mockGenre); // current slug: 'rock'
      repo.findBySlug.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockGenre, slug: 'rock-nuevo' });

      await service.update('uuid-genre-1', dto);

      expect(repo.findBySlug).toHaveBeenCalledWith('rock-nuevo');
      expect(repo.update).toHaveBeenCalledWith('uuid-genre-1', dto);
    });

    it('should throw ConflictException when new slug is taken by another genre', async () => {
      const dto: UpdateGenreDto = { slug: 'pop' };
      repo.findById.mockResolvedValue(mockGenre); // id: 'uuid-genre-1'
      repo.findBySlug.mockResolvedValue({
        ...mockGenre,
        id: 'uuid-genre-2',
        name: 'Pop',
        slug: 'pop',
      });

      await expect(service.update('uuid-genre-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should allow update when slug belongs to the same genre', async () => {
      const dto: UpdateGenreDto = { slug: 'rock' };
      repo.findById.mockResolvedValue(mockGenre); // current slug: 'rock', id: 'uuid-genre-1'
      repo.findBySlug.mockResolvedValue(mockGenre); // returns same genre
      repo.update.mockResolvedValue(mockGenre);

      const result = await service.update('uuid-genre-1', dto);

      expect(result).toEqual(mockGenre);
      expect(repo.update).toHaveBeenCalledWith('uuid-genre-1', dto);
    });

    it('should check name uniqueness when name is changed', async () => {
      const dto: UpdateGenreDto = { name: 'Rock Alternativo' };
      repo.findById.mockResolvedValue(mockGenre); // current name: 'Rock'
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockGenre, name: 'Rock Alternativo' });

      await service.update('uuid-genre-1', dto);

      expect(repo.findByName).toHaveBeenCalledWith('Rock Alternativo');
      expect(repo.update).toHaveBeenCalledWith('uuid-genre-1', dto);
    });

    it('should throw ConflictException when new name is taken by another genre', async () => {
      const dto: UpdateGenreDto = { name: 'Pop' };
      repo.findById.mockResolvedValue(mockGenre); // id: 'uuid-genre-1'
      repo.findByName.mockResolvedValue({
        ...mockGenre,
        id: 'uuid-genre-2',
        name: 'Pop',
        slug: 'pop',
      });

      await expect(service.update('uuid-genre-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  // ── remove() ─────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should throw NotFoundException when genre does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('should hard-delete the genre', async () => {
      repo.findById.mockResolvedValue(mockGenre);
      repo.delete.mockResolvedValue(mockGenre);

      await service.remove('uuid-genre-1');

      expect(repo.delete).toHaveBeenCalledWith('uuid-genre-1');
    });
  });
});
