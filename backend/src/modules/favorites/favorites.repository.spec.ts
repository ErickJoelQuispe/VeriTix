import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { FavoritesRepository } from './favorites.repository';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockFavorite = {
  id: 'fav-uuid-1',
  userId: 'user-uuid-1',
  eventId: 'event-uuid-1',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  event: {
    id: 'event-uuid-1',
    name: 'Rock en el Foro',
    eventDate: new Date('2026-12-31T21:00:00Z'),
    imageUrl: null,
    venue: { id: 'venue-uuid-1', name: 'Foro Sol', city: 'CDMX' },
    format: null,
  },
};

const mockFavoriteForAlert = {
  id: 'fav-uuid-1',
  userId: 'user-uuid-1',
  eventId: 'event-uuid-1',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  user: { id: 'user-uuid-1', email: 'buyer@test.com', name: 'Test Buyer' },
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPrisma = {
  favorite: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('FavoritesRepository', () => {
  let repo: FavoritesRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repo = module.get<FavoritesRepository>(FavoritesRepository);
  });

  // ── toggle ───────────────────────────────────────────────────────────────

  describe('toggle()', () => {
    it('creates a new favorite and returns { favorited: true } when none exists', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(null);
      mockPrisma.favorite.create.mockResolvedValue(mockFavorite);

      const result = await repo.toggle('user-uuid-1', 'event-uuid-1');

      expect(mockPrisma.favorite.create).toHaveBeenCalledWith({
        data: { userId: 'user-uuid-1', eventId: 'event-uuid-1' },
      });
      expect(result).toEqual({ favorited: true });
    });

    it('deletes the existing favorite and returns { favorited: false } when it exists', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(mockFavorite);
      mockPrisma.favorite.delete.mockResolvedValue(mockFavorite);

      const result = await repo.toggle('user-uuid-1', 'event-uuid-1');

      expect(mockPrisma.favorite.delete).toHaveBeenCalledWith({
        where: { userId_eventId: { userId: 'user-uuid-1', eventId: 'event-uuid-1' } },
      });
      expect(result).toEqual({ favorited: false });
    });
  });

  // ── findByUserId ──────────────────────────────────────────────────────────

  describe('findByUserId()', () => {
    it('returns a paginated list of favorites with enriched event data', async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([mockFavorite]);
      mockPrisma.favorite.count.mockResolvedValue(1);

      const result = await repo.findByUserId('user-uuid-1', 1, 10);

      expect(mockPrisma.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-uuid-1' },
          skip: 0,
          take: 10,
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].event.name).toBe('Rock en el Foro');
      expect(result.meta.total).toBe(1);
    });

    it('returns empty data with total 0 when the user has no favorites', async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([]);
      mockPrisma.favorite.count.mockResolvedValue(0);

      const result = await repo.findByUserId('user-uuid-1', 1, 10);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  // ── findByUserIdAndEventId ────────────────────────────────────────────────

  describe('findByUserIdAndEventId()', () => {
    it('returns true when the favorite exists', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(mockFavorite);

      const result = await repo.findByUserIdAndEventId('user-uuid-1', 'event-uuid-1');

      expect(result).toBe(true);
    });

    it('returns false when the favorite does not exist', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(null);

      const result = await repo.findByUserIdAndEventId('user-uuid-1', 'event-uuid-1');

      expect(result).toBe(false);
    });
  });

  // ── findByEventId ─────────────────────────────────────────────────────────

  describe('findByEventId()', () => {
    it('returns all favorites for an event with user email/name for alerts', async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([mockFavoriteForAlert]);

      const result = await repo.findByEventId('event-uuid-1');

      expect(mockPrisma.favorite.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-uuid-1' },
        select: {
          user: { select: { id: true, email: true, name: true } },
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].user.email).toBe('buyer@test.com');
    });

    it('returns empty array when no favorites exist for the event', async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([]);

      const result = await repo.findByEventId('event-uuid-2');

      expect(result).toHaveLength(0);
    });
  });
});
