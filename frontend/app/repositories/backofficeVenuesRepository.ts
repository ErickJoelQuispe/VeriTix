import type {
  BackofficeVenueListQuery,
  BackofficeVenueRecord,
  PaginatedResponse,
} from '~~/shared/types'

export function useBackofficeVenuesRepository() {
  const apiRequest = useApiRequest()
  const { requireBackofficeHeaders } = useBackofficeApi()

  async function listVenues(query: BackofficeVenueListQuery): Promise<PaginatedResponse<BackofficeVenueRecord>> {
    return apiRequest<PaginatedResponse<BackofficeVenueRecord>>('/admin/venues', {
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
