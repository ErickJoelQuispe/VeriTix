import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/dto';
import { Role } from '../../generated/prisma/enums';
import { EventsRepository } from '../events/events.repository';
import { TicketsRepository } from '../tickets/tickets.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewRecord, ReviewWithUser, ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly eventsRepository: EventsRepository,
    private readonly ticketsRepository: TicketsRepository,
  ) {}

  /**
   * Create a review for an event.
   * Rules:
   *  1. Event must exist → 404
   *  2. Buyer must have ≥1 USED ticket for the event → 403
   *  3. Buyer must not already have a review for the event → 409
   */
  async create(userId: string, dto: CreateReviewDto): Promise<ReviewRecord> {
    // 1. Verify event exists
    const event = await this.eventsRepository.findById(dto.eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 2. Verify buyer attended (has at least one USED ticket for this event)
    const tickets = await this.ticketsRepository.findByBuyerWithEvents(userId);
    const hasUsedTicket = tickets.some(
      (t) => t.event.id === dto.eventId && t.status === 'USED',
    );
    if (!hasUsedTicket) {
      throw new ForbiddenException('You must have attended this event to leave a review');
    }

    // 3. Verify no duplicate review
    const existing = await this.reviewsRepository.findByUserAndEvent(userId, dto.eventId);
    if (existing) {
      throw new ConflictException('You have already reviewed this event');
    }

    return this.reviewsRepository.create({
      userId,
      eventId: dto.eventId,
      rating: dto.rating,
      comment: dto.comment,
    });
  }

  /**
   * Update a review. Only the author may update.
   */
  async update(reviewId: string, userId: string, dto: UpdateReviewDto): Promise<ReviewRecord> {
    const review = await this.reviewsRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    return this.reviewsRepository.update(reviewId, dto);
  }

  /**
   * Delete a review. Author or ADMIN may delete.
   */
  async delete(reviewId: string, userId: string, userRole: Role): Promise<void> {
    const review = await this.reviewsRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewsRepository.delete(reviewId);
  }

  /**
   * List reviews for an event (public, no auth required).
   */
  findByEvent(
    eventId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<ReviewWithUser>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.reviewsRepository.findByEventId(eventId, page, limit);
  }
}
