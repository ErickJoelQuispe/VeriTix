import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { ReviewsRepository } from './reviews.repository';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockReview = {
  id: 'review-uuid-1',
  userId: 'user-uuid-1',
  eventId: 'event-uuid-1',
  rating: 4,
  comment: 'Great event!',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

const mockReviewWithUser = {
  ...mockReview,
  user: { name: 'Juan', lastName: 'Pérez' },
};

// ── Mock Prisma ───────────────────────────────────────────────────────────────

const mockPrisma = {
  review: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ReviewsRepository', () => {
  let repository: ReviewsRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<ReviewsRepository>(ReviewsRepository);
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates a review and returns the created record', async () => {
      mockPrisma.review.create.mockResolvedValue(mockReview);

      const result = await repository.create({
        userId: 'user-uuid-1',
        eventId: 'event-uuid-1',
        rating: 4,
        comment: 'Great event!',
      });

      expect(mockPrisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: 'user-uuid-1', eventId: 'event-uuid-1', rating: 4, comment: 'Great event!' },
        }),
      );
      expect(result.id).toBe('review-uuid-1');
      expect(result.rating).toBe(4);
    });

    it('creates a review with a different rating', async () => {
      const lowRatingReview = { ...mockReview, rating: 1, comment: 'Disappointing.' };
      mockPrisma.review.create.mockResolvedValue(lowRatingReview);

      const result = await repository.create({
        userId: 'user-uuid-2',
        eventId: 'event-uuid-2',
        rating: 1,
        comment: 'Disappointing.',
      });

      expect(result.rating).toBe(1);
      expect(result.comment).toBe('Disappointing.');
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('returns a review with user name when found', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(mockReviewWithUser);

      const result = await repository.findById('review-uuid-1');

      expect(mockPrisma.review.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'review-uuid-1' } }),
      );
      expect(result).not.toBeNull();
      expect(result!.user.name).toBe('Juan');
      expect(result!.user.lastName).toBe('Pérez');
    });

    it('returns null when review does not exist', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      const result = await repository.findById('review-uuid-999');

      expect(result).toBeNull();
    });
  });

  // ── findByEventId ─────────────────────────────────────────────────────────

  describe('findByEventId()', () => {
    it('returns paginated reviews for an event with user data', async () => {
      mockPrisma.review.findMany.mockResolvedValue([mockReviewWithUser]);
      mockPrisma.review.count.mockResolvedValue(1);

      const result = await repository.findByEventId('event-uuid-1', 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].user.name).toBe('Juan');
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('returns empty paginated response when no reviews exist', async () => {
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.review.count.mockResolvedValue(0);

      const result = await repository.findByEventId('event-uuid-999', 1, 10);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  // ── findByUserAndEvent ────────────────────────────────────────────────────

  describe('findByUserAndEvent()', () => {
    it('returns the review when it exists for (userId, eventId)', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(mockReview);

      const result = await repository.findByUserAndEvent('user-uuid-1', 'event-uuid-1');

      expect(mockPrisma.review.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_eventId: { userId: 'user-uuid-1', eventId: 'event-uuid-1' } },
        }),
      );
      expect(result).not.toBeNull();
      expect(result!.id).toBe('review-uuid-1');
    });

    it('returns null when no review exists for the user+event pair', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      const result = await repository.findByUserAndEvent('user-uuid-1', 'event-uuid-999');

      expect(result).toBeNull();
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('updates the rating and comment of a review', async () => {
      const updated = { ...mockReview, rating: 5, comment: 'Actually amazing!' };
      mockPrisma.review.update.mockResolvedValue(updated);

      const result = await repository.update('review-uuid-1', { rating: 5, comment: 'Actually amazing!' });

      expect(mockPrisma.review.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'review-uuid-1' },
          data: { rating: 5, comment: 'Actually amazing!' },
        }),
      );
      expect(result.rating).toBe(5);
      expect(result.comment).toBe('Actually amazing!');
    });

    it('updates only the rating when comment is not provided', async () => {
      const updated = { ...mockReview, rating: 2 };
      mockPrisma.review.update.mockResolvedValue(updated);

      const result = await repository.update('review-uuid-1', { rating: 2 });

      expect(result.rating).toBe(2);
      expect(result.comment).toBe('Great event!');
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────

  describe('delete()', () => {
    it('deletes a review by id and returns void', async () => {
      mockPrisma.review.delete.mockResolvedValue(mockReview);

      await repository.delete('review-uuid-1');

      expect(mockPrisma.review.delete).toHaveBeenCalledWith({
        where: { id: 'review-uuid-1' },
      });
    });

    it('resolves void even for a different review id', async () => {
      mockPrisma.review.delete.mockResolvedValue({ ...mockReview, id: 'review-uuid-2' });

      await repository.delete('review-uuid-2');

      expect(mockPrisma.review.delete).toHaveBeenCalledWith({
        where: { id: 'review-uuid-2' },
      });
    });
  });
});
