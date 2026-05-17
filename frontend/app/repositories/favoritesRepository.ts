import type { FavoriteStatus } from '~~/shared/types'

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

  return {
    toggleFavorite,
    getFavoriteStatus,
  }
}
