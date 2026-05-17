import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../../generated/prisma/enums';
import { EventsRepository } from '../events/events.repository';
import { TicketsRepository } from '../tickets/tickets.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockEvent = {
  id: 'event-uuid-1',
  name: 'Rock en el Foro',
  eventDate: new Date('2026-12-31T21:00:00Z'),
  status: 'PUBLISHED',
};

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

const mockUsedTicket = {
  id: 'ticket-uuid-1',
  status: 'USED',
  event: { id: 'event-uuid-1' },
};

const mockPaginatedReviews = {
  data: [mockReviewWithUser],
  meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockReviewsRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEventId: jest.fn(),
  findByUserAndEvent: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockEventsRepository = {
  findById: jest.fn(),
};

const mockTicketsRepository = {
  findByBuyerWithEvents: jest.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewsRepository, useValue: mockReviewsRepository },
        { provide: EventsRepository, useValue: mockEventsRepository },
        { provide: TicketsRepository, useValue: mockTicketsRepository },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  // ── create ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    const dto: CreateReviewDto = {
      eventId: 'event-uuid-1',
      rating: 4,
      comment: 'Great event!',
    };

    it('creates a review when user has a USED ticket for the event and no previous review', async () => {
      mockEventsRepository.findById.mockResolvedValue(mockEvent);
      mockTicketsRepository.findByBuyerWithEvents.mockResolvedValue([mockUsedTicket]);
      mockReviewsRepository.findByUserAndEvent.mockResolvedValue(null);
      mockReviewsRepository.create.mockResolvedValue(mockReview);

      const result = await service.create('user-uuid-1', dto);

      expect(mockEventsRepository.findById).toHaveBeenCalledWith('event-uuid-1');
      expect(mockReviewsRepository.findByUserAndEvent).toHaveBeenCalledWith('user-uuid-1', 'event-uuid-1');
      expect(mockReviewsRepository.create).toHaveBeenCalledWith({
        userId: 'user-uuid-1',
        eventId: 'event-uuid-1',
        rating: 4,
        comment: 'Great event!',
      });
      expect(result.id).toBe('review-uuid-1');
    });

    it('throws NotFoundException when the event does not exist', async () => {
      mockEventsRepository.findById.mockResolvedValue(null);

      await expect(service.create('user-uuid-1', dto)).rejects.toThrow(NotFoundException);
      expect(mockTicketsRepository.findByBuyerWithEvents).not.toHaveBeenCalled();
      expect(mockReviewsRepository.create).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when user has no USED ticket for the event', async () => {
      mockEventsRepository.findById.mockResolvedValue(mockEvent);
      // Only ACTIVE ticket — no USED
      mockTicketsRepository.findByBuyerWithEvents.mockResolvedValue([
        { id: 'ticket-uuid-2', status: 'ACTIVE', event: { id: 'event-uuid-1' } },
      ]);

      await expect(service.create('user-uuid-1', dto)).rejects.toThrow(ForbiddenException);
      expect(mockReviewsRepository.create).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException with correct message when attendance check fails', async () => {
      mockEventsRepository.findById.mockResolvedValue(mockEvent);
      mockTicketsRepository.findByBuyerWithEvents.mockResolvedValue([]);

      await expect(service.create('user-uuid-1', dto)).rejects.toThrow(
        'You must have attended this event to leave a review',
      );
    });

    it('throws ConflictException when user already has a review for the event', async () => {
      mockEventsRepository.findById.mockResolvedValue(mockEvent);
      mockTicketsRepository.findByBuyerWithEvents.mockResolvedValue([mockUsedTicket]);
      mockReviewsRepository.findByUserAndEvent.mockResolvedValue(mockReview);

      await expect(service.create('user-uuid-1', dto)).rejects.toThrow(ConflictException);
      expect(mockReviewsRepository.create).not.toHaveBeenCalled();
    });
  });

  // ── update ───────────────────────────────────────────────────────────────

  describe('update()', () => {
    const dto: UpdateReviewDto = { rating: 5 };

    it('updates the review when the caller is the author', async () => {
      mockReviewsRepository.findById.mockResolvedValue(mockReviewWithUser);
      const updated = { ...mockReview, rating: 5 };
      mockReviewsRepository.update.mockResolvedValue(updated);

      const result = await service.update('review-uuid-1', 'user-uuid-1', dto);

      expect(mockReviewsRepository.update).toHaveBeenCalledWith('review-uuid-1', dto);
      expect(result.rating).toBe(5);
    });

    it('throws NotFoundException when review does not exist', async () => {
      mockReviewsRepository.findById.mockResolvedValue(null);

      await expect(service.update('review-uuid-999', 'user-uuid-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when caller is not the review author', async () => {
      mockReviewsRepository.findById.mockResolvedValue({
        ...mockReviewWithUser,
        userId: 'user-uuid-OTHER',
      });

      await expect(service.update('review-uuid-1', 'user-uuid-1', dto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockReviewsRepository.update).not.toHaveBeenCalled();
    });
  });

  // ── delete ───────────────────────────────────────────────────────────────

  describe('delete()', () => {
    it('deletes the review when the caller is the author', async () => {
      mockReviewsRepository.findById.mockResolvedValue(mockReviewWithUser);
      mockReviewsRepository.delete.mockResolvedValue(undefined);

      await service.delete('review-uuid-1', 'user-uuid-1', Role.BUYER);

      expect(mockReviewsRepository.delete).toHaveBeenCalledWith('review-uuid-1');
    });

    it('deletes the review when the caller is ADMIN (even if not author)', async () => {
      mockReviewsRepository.findById.mockResolvedValue({
        ...mockReviewWithUser,
        userId: 'user-uuid-OTHER',
      });
      mockReviewsRepository.delete.mockResolvedValue(undefined);

      await service.delete('review-uuid-1', 'user-uuid-admin', Role.ADMIN);

      expect(mockReviewsRepository.delete).toHaveBeenCalledWith('review-uuid-1');
    });

    it('throws NotFoundException when review does not exist', async () => {
      mockReviewsRepository.findById.mockResolvedValue(null);

      await expect(
        service.delete('review-uuid-999', 'user-uuid-1', Role.BUYER),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when caller is not author and not ADMIN', async () => {
      mockReviewsRepository.findById.mockResolvedValue({
        ...mockReviewWithUser,
        userId: 'user-uuid-OTHER',
      });

      await expect(
        service.delete('review-uuid-1', 'user-uuid-1', Role.BUYER),
      ).rejects.toThrow(ForbiddenException);
      expect(mockReviewsRepository.delete).not.toHaveBeenCalled();
    });
  });

  // ── findByEvent ───────────────────────────────────────────────────────────

  describe('findByEvent()', () => {
    it('returns paginated reviews for a given event', async () => {
      mockReviewsRepository.findByEventId.mockResolvedValue(mockPaginatedReviews);

      const result = await service.findByEvent('event-uuid-1', { page: 1, limit: 10 });

      expect(mockReviewsRepository.findByEventId).toHaveBeenCalledWith('event-uuid-1', 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('uses default page=1 and limit=10 when query values are not provided', async () => {
      mockReviewsRepository.findByEventId.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const result = await service.findByEvent('event-uuid-1', {});

      expect(mockReviewsRepository.findByEventId).toHaveBeenCalledWith('event-uuid-1', 1, 10);
      expect(result.data).toHaveLength(0);
    });
  });
});
