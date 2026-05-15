import { Injectable } from '@nestjs/common';
import { PaginatedResponse, createPaginatedResponse } from '@common/dto';
import { PrismaService } from '../../prisma/prisma.service';
import { EVENT_ENRICHED_SELECT } from '../events/events.repository';
import { FavoriteItemDto } from './dto';

// ── Types ─────────────────────────────────────────────────────────────────────

export type FavoriteAlertRecipient = {
  user: { id: string; email: string; name: string };
};

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class FavoritesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Toggle favorite for (userId, eventId).
   * Creates a Favorite if none exists → returns { favorited: true }.
   * Deletes the existing Favorite if one exists → returns { favorited: false }.
   */
  async toggle(
    userId: string,
    eventId: string,
  ): Promise<{ favorited: boolean }> {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { userId_eventId: { userId, eventId } },
      });
      return { favorited: false };
    }

    await this.prisma.favorite.create({
      data: { userId, eventId },
    });
    return { favorited: true };
  }

  /**
   * Paginated list of favorites for a user, enriched with event data.
   */
  async findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<FavoriteItemDto>> {
    const [data, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        select: {
          id: true,
          createdAt: true,
          event: { select: EVENT_ENRICHED_SELECT },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    return createPaginatedResponse(data as unknown as FavoriteItemDto[], total, page, limit);
  }

  /**
   * Returns true if the user has favorited the event, false otherwise.
   */
  async findByUserIdAndEventId(userId: string, eventId: string): Promise<boolean> {
    const record = await this.prisma.favorite.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    return record !== null;
  }

  /**
   * Returns all favorites for an event with user info (for alert processor).
   */
  findByEventId(eventId: string): Promise<FavoriteAlertRecipient[]> {
    return this.prisma.favorite.findMany({
      where: { eventId },
      select: {
        user: { select: { id: true, email: true, name: true } },
      },
    }) as Promise<FavoriteAlertRecipient[]>;
  }
}
