import type { PaginatedResponse } from '~~/shared/api/types'
import type { MyEventItem } from '~~/shared/types'
import { compactQuery } from '~~/shared/query'

export function useMyEventsRepository() {
  const apiRequest = useApiRequest()

  /**
   * GET /events/mine?upcoming=true|false&page=1&limit=20
   * Returns buyer events grouped by event with ticketCount and dominantStatus.
   */
  async function listMyEvents(params: {
    upcoming?: boolean
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<MyEventItem>> {
    return apiRequest<PaginatedResponse<MyEventItem>>('/events/mine', {
      method: 'GET',
      query: compactQuery({
        upcoming: params.upcoming,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }),
    })
  }

  return {
    listMyEvents,
  }
}
