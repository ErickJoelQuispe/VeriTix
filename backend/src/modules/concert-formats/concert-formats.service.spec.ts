import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../cache';
import { CreateConcertFormatDto, UpdateConcertFormatDto } from './dto';
import { ConcertFormatsRepository } from './concert-formats.repository';
import { ConcertFormatsService } from './concert-formats.service';

const mockCacheService = {
  getOrSet: jest.fn((_k: string, fn: () => any) => fn()),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

// ── Mock data ────────────────────────────────────────────────────────────────

const mockFormat = {
  id: 'uuid-format-1',
  name: 'Concierto',
  slug: 'concierto',
  description: 'Evento musical en vivo con uno o varios artistas.',
  icon: 'concert-icon',
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('ConcertFormatsService', () => {
  let service: ConcertFormatsService;
  let repo: jest.Mocked<ConcertFormatsRepository>;

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
        ConcertFormatsService,
        { provide: ConcertFormatsRepository, useValue: mockRepo },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<ConcertFormatsService>(ConcertFormatsService);
    repo = module.get(
      ConcertFormatsRepository,
    ) as jest.Mocked<ConcertFormatsRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create a concert format when slug and name are unique', async () => {
      const dto: CreateConcertFormatDto = {
        name: 'Concierto',
        slug: 'concierto',
        description: 'Evento musical en vivo con uno o varios artistas.',
        icon: 'concert-icon',
      };
      repo.findBySlug.mockResolvedValue(null);
      repo.findByName.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockFormat);

      const result = await service.create(dto);

      expect(repo.findBySlug).toHaveBeenCalledWith('concierto');
      expect(repo.findByName).toHaveBeenCalledWith('Concierto');
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockFormat);
    });

    it('should throw ConflictException when slug already exists', async () => {
      const dto: CreateConcertFormatDto = {
        name: 'Festival Alternativo',
        slug: 'concierto',
      };
      repo.findBySlug.mockResolvedValue(mockFormat);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repo.findByName).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when name already exists', async () => {
      const dto: CreateConcertFormatDto = {
        name: 'Concierto',
        slug: 'concierto-nuevo',
      };
      repo.findBySlug.mockResolvedValue(null);
      repo.findByName.mockResolvedValue(mockFormat);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should return the full list of concert formats', async () => {
      const formats = [
        mockFormat,
        {
          ...mockFormat,
          id: 'uuid-format-2',
          name: 'Festival',
          slug: 'festival',
        },
      ];
      repo.findAll.mockResolvedValue(formats);

      const result = await service.findAll();

      expect(repo.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(formats);
    });

    it('should return an empty array when there are no concert formats', async () => {
      repo.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return the concert format when found', async () => {
      repo.findById.mockResolvedValue(mockFormat);

      const result = await service.findOne('uuid-format-1');

      expect(result).toEqual(mockFormat);
      expect(repo.findById).toHaveBeenCalledWith('uuid-format-1');
    });

    it('should throw NotFoundException when concert format does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update() ─────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('should update concert format fields', async () => {
      const dto: UpdateConcertFormatDto = { description: 'Nueva descripción' };
      const updated = { ...mockFormat, description: 'Nueva descripción' };
      repo.findById.mockResolvedValue(mockFormat);
      repo.update.mockResolvedValue(updated);

      const result = await service.update('uuid-format-1', dto);

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith('uuid-format-1', dto);
      expect(repo.findBySlug).not.toHaveBeenCalled();
      expect(repo.findByName).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when concert format does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update('uuid-not-found', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should check slug uniqueness when slug is changed', async () => {
      const dto: UpdateConcertFormatDto = { slug: 'concierto-nuevo' };
      repo.findById.mockResolvedValue(mockFormat);
      repo.findBySlug.mockResolvedValue(null);
      repo.update.mockResolvedValue({
        ...mockFormat,
        slug: 'concierto-nuevo',
      });

      await service.update('uuid-format-1', dto);

      expect(repo.findBySlug).toHaveBeenCalledWith('concierto-nuevo');
      expect(repo.update).toHaveBeenCalledWith('uuid-format-1', dto);
    });

    it('should throw ConflictException when new slug is taken by another format', async () => {
      const dto: UpdateConcertFormatDto = { slug: 'festival' };
      repo.findById.mockResolvedValue(mockFormat);
      repo.findBySlug.mockResolvedValue({
        ...mockFormat,
        id: 'uuid-format-2',
        name: 'Festival',
        slug: 'festival',
      });

      await expect(service.update('uuid-format-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should allow update when slug belongs to the same format', async () => {
      const dto: UpdateConcertFormatDto = { slug: 'concierto' };
      repo.findById.mockResolvedValue(mockFormat);
      repo.findBySlug.mockResolvedValue(mockFormat);
      repo.update.mockResolvedValue(mockFormat);

      const result = await service.update('uuid-format-1', dto);

      expect(result).toEqual(mockFormat);
      expect(repo.update).toHaveBeenCalledWith('uuid-format-1', dto);
    });

    it('should check name uniqueness when name is changed', async () => {
      const dto: UpdateConcertFormatDto = { name: 'Festival' };
      repo.findById.mockResolvedValue(mockFormat);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockFormat, name: 'Festival' });

      await service.update('uuid-format-1', dto);

      expect(repo.findByName).toHaveBeenCalledWith('Festival');
      expect(repo.update).toHaveBeenCalledWith('uuid-format-1', dto);
    });

    it('should throw ConflictException when new name is taken by another format', async () => {
      const dto: UpdateConcertFormatDto = { name: 'Festival' };
      repo.findById.mockResolvedValue(mockFormat);
      repo.findByName.mockResolvedValue({
        ...mockFormat,
        id: 'uuid-format-2',
        name: 'Festival',
        slug: 'festival',
      });

      await expect(service.update('uuid-format-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  // ── remove() ─────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should throw NotFoundException when concert format does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('should hard-delete the concert format', async () => {
      repo.findById.mockResolvedValue(mockFormat);
      repo.delete.mockResolvedValue(mockFormat);

      await service.remove('uuid-format-1');

      expect(repo.delete).toHaveBeenCalledWith('uuid-format-1');
    });
  });
});
