import type { FavoriteItem, FavoriteStatus } from '~~/shared/types'
import type { PaginatedResponse } from '~~/shared/api/types'
import { compactQuery } from '~~/shared/query'

export function useFavoritesRepository() {
  const apiRequest = useApiRequest()

  /**
   * POST /favorites/events/:eventId
   * Toggles favorite status for an event. Returns { isFavorite: boolean }.
   */
  async function toggleFavorite(eventId: string): Promise<FavoriteStatus> {
    return apiRequest<FavoriteStatus>(`/favorites/events/${eventId}`, {
      method: 'POST',
    })
  }

  /**
   * GET /favorites/events/:eventId
   * Checks whether the authenticated buyer has favorited this event.
   */
  async function getFavoriteStatus(eventId: string): Promise<FavoriteStatus> {
    return apiRequest<FavoriteStatus>(`/favorites/events/${eventId}`, {
      method: 'GET',
    })
  }

  /**
   * GET /favorites/events?page=1&limit=20
   * Returns paginated favorites for the authenticated buyer.
   */
  async function listFavorites(params: {
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<FavoriteItem>> {
    return apiRequest<PaginatedResponse<FavoriteItem>>('/favorites/events', {
      method: 'GET',
      query: compactQuery({
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }),
    })
  }

  return {
    toggleFavorite,
    getFavoriteStatus,
    listFavorites,
  }
}
