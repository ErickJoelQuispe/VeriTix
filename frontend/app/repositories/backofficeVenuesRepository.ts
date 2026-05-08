import type {
  BackofficeVenueListQuery,
  BackofficeVenueRecord,
} from '~~/shared/types/backoffice'
import type { PaginatedResponse as ApiPaginatedResponse } from '~~/shared/types/api'

export function useBackofficeVenuesRepository() {
  const apiRequest = useApiRequest()
  const { requireBackofficeHeaders } = useBackofficeApi()

  async function listVenues(query: BackofficeVenueListQuery): Promise<ApiPaginatedResponse<BackofficeVenueRecord>> {
    return apiRequest<ApiPaginatedResponse<BackofficeVenueRecord>>('/admin/venues', {
      method: 'GET',
      headers: requireBackofficeHeaders(),
      query: {
        page: query.pageValue,
        limit: query.pageSize,
        search: query.search.trim() || undefined,
        city: query.city.trim() || undefined,
        isActive: query.isActive || undefined,
      },
    })
  }

  return {
    listVenues,
  }
}
