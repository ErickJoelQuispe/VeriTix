import { Injectable } from '@nestjs/common';
import { PaginatedResponse, createPaginatedResponse } from '@common/dto';
import { PrismaService } from '../../prisma/prisma.service';

// ── Select constants ──────────────────────────────────────────────────────────

const REVIEW_WITH_USER_SELECT = {
  id: true,
  userId: true,
  eventId: true,
  rating: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      name: true,
      lastName: true,
    },
  },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReviewWithUser = {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user: { name: string; lastName: string };
};

export type ReviewRecord = {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new review record.
   */
  create(data: {
    userId: string;
    eventId: string;
    rating: number;
    comment: string;
  }): Promise<ReviewRecord> {
    return this.prisma.review.create({
      data,
    }) as Promise<ReviewRecord>;
  }

  /**
   * Finds a review by id, including the author's name and lastName.
   */
  findById(id: string): Promise<ReviewWithUser | null> {
    return this.prisma.review.findUnique({
      where: { id },
      select: REVIEW_WITH_USER_SELECT,
    }) as Promise<ReviewWithUser | null>;
  }

  /**
   * Returns paginated reviews for a given event, with author name (no email).
   */
  async findByEventId(
    eventId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<ReviewWithUser>> {
    const where = { eventId };

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        select: REVIEW_WITH_USER_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return createPaginatedResponse(data as unknown as ReviewWithUser[], total, page, limit);
  }

  /**
   * Finds a review by (userId, eventId) — used for duplicate check and
   * attendance prerequisite verification.
   */
  findByUserAndEvent(userId: string, eventId: string): Promise<ReviewRecord | null> {
    return this.prisma.review.findUnique({
      where: { userId_eventId: { userId, eventId } },
    }) as Promise<ReviewRecord | null>;
  }

  /**
   * Updates rating and/or comment of an existing review.
   */
  update(
    id: string,
    data: { rating?: number; comment?: string },
  ): Promise<ReviewRecord> {
    return this.prisma.review.update({
      where: { id },
      data,
    }) as Promise<ReviewRecord>;
  }

  /**
   * Deletes a review by id.
   */
  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({ where: { id } });
  }
}
