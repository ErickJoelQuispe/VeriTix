import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResponse } from '@common/dto';
import { EventsRepository } from '../events/events.repository';
import { FavoriteItemDto, FavoritesQueryDto, ToggleFavoriteResponseDto } from './dto';
import { FavoritesRepository } from './favorites.repository';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly eventsRepository: EventsRepository,
  ) {}

  /**
   * Toggle favorite status for (userId, eventId).
   * Throws 404 if the event does not exist.
   */
  async toggle(userId: string, eventId: string): Promise<ToggleFavoriteResponseDto> {
    const event = await this.eventsRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return this.favoritesRepository.toggle(userId, eventId);
  }

  /**
   * Return paginated list of favorites for a user with enriched event data.
   */
  findAll(
    userId: string,
    query: FavoritesQueryDto,
  ): Promise<PaginatedResponse<FavoriteItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return this.favoritesRepository.findByUserId(userId, page, limit);
  }

  /**
   * Return { isFavorite: boolean } for a given (userId, eventId).
   */
  async checkStatus(
    userId: string,
    eventId: string,
  ): Promise<{ isFavorite: boolean }> {
    const isFavorite = await this.favoritesRepository.findByUserIdAndEventId(userId, eventId);
    return { isFavorite };
  }
}
