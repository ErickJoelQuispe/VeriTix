import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesRepository } from './favorites.repository';
import { FavoritesService } from './favorites.service';
import { EventsRepository } from '../events/events.repository';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockEvent = {
  id: 'event-uuid-1',
  name: 'Rock en el Foro',
  eventDate: new Date('2026-12-31T21:00:00Z'),
  status: 'PUBLISHED',
};

const mockFavoriteItem = {
  id: 'fav-uuid-1',
  event: {
    id: 'event-uuid-1',
    name: 'Rock en el Foro',
    eventDate: new Date('2026-12-31T21:00:00Z'),
    imageUrl: null,
    venue: { id: 'venue-uuid-1', name: 'Foro Sol', city: 'CDMX' },
    format: null,
  },
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

const mockPaginatedFavorites = {
  data: [mockFavoriteItem],
  meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockFavoritesRepository = {
  toggle: jest.fn(),
  findByUserId: jest.fn(),
  findByUserIdAndEventId: jest.fn(),
  findByEventId: jest.fn(),
};

const mockEventsRepository = {
  findById: jest.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: FavoritesRepository, useValue: mockFavoritesRepository },
        { provide: EventsRepository, useValue: mockEventsRepository },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  // ── toggle ───────────────────────────────────────────────────────────────

  describe('toggle()', () => {
    it('creates a new favorite when the event exists and no favorite exists', async () => {
      mockEventsRepository.findById.mockResolvedValue(mockEvent);
      mockFavoritesRepository.toggle.mockResolvedValue({ favorited: true });

      const result = await service.toggle('user-uuid-1', 'event-uuid-1');

      expect(mockEventsRepository.findById).toHaveBeenCalledWith('event-uuid-1');
      expect(mockFavoritesRepository.toggle).toHaveBeenCalledWith('user-uuid-1', 'event-uuid-1');
      expect(result).toEqual({ favorited: true });
    });

    it('removes a favorite when the event exists and a favorite already exists', async () => {
      mockEventsRepository.findById.mockResolvedValue(mockEvent);
      mockFavoritesRepository.toggle.mockResolvedValue({ favorited: false });

      const result = await service.toggle('user-uuid-1', 'event-uuid-1');

      expect(result).toEqual({ favorited: false });
    });

    it('throws NotFoundException when the event does not exist', async () => {
      mockEventsRepository.findById.mockResolvedValue(null);

      await expect(service.toggle('user-uuid-1', 'event-uuid-999')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockFavoritesRepository.toggle).not.toHaveBeenCalled();
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('returns a paginated list of favorites for the user', async () => {
      mockFavoritesRepository.findByUserId.mockResolvedValue(mockPaginatedFavorites);

      const result = await service.findAll('user-uuid-1', { page: 1, limit: 20 });

      expect(mockFavoritesRepository.findByUserId).toHaveBeenCalledWith('user-uuid-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('returns empty paginated response when user has no favorites', async () => {
      mockFavoritesRepository.findByUserId.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const result = await service.findAll('user-uuid-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  // ── checkStatus ───────────────────────────────────────────────────────────

  describe('checkStatus()', () => {
    it('returns { isFavorite: true } when the event is favorited', async () => {
      mockFavoritesRepository.findByUserIdAndEventId.mockResolvedValue(true);

      const result = await service.checkStatus('user-uuid-1', 'event-uuid-1');

      expect(result).toEqual({ isFavorite: true });
    });

    it('returns { isFavorite: false } when the event is not favorited', async () => {
      mockFavoritesRepository.findByUserIdAndEventId.mockResolvedValue(false);

      const result = await service.checkStatus('user-uuid-1', 'event-uuid-1');

      expect(result).toEqual({ isFavorite: false });
    });
  });
});
