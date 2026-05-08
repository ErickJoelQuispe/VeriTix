import type { PaginatedResponse } from '~~/shared/api/types'
import type {
  BackofficeVenueListQuery,
  BackofficeVenueRecord,
} from '~~/shared/types'
import { compactQuery } from '~~/shared/query'

export function useBackofficeVenuesRepository() {
  const apiRequest = useApiRequest()
  const { requireBackofficeHeaders } = useBackofficeApi()

  async function listVenues(query: BackofficeVenueListQuery): Promise<PaginatedResponse<BackofficeVenueRecord>> {
    return apiRequest<PaginatedResponse<BackofficeVenueRecord>>('/admin/venues', {
      method: 'GET',
      headers: requireBackofficeHeaders(),
      query: compactQuery({
        page: query.pageValue,
        limit: query.pageSize,
        search: query.search,
        city: query.city,
        isActive: query.isActive,
      }),
    })
  }

  return {
    listVenues,
  }
}
