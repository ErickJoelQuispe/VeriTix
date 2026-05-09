import type { PublicVenueListApiItem } from '~~/shared/api/public-venues'
import type { PaginatedResponse } from '~~/shared/api/types'
import type { VenueCatalogFilters } from '~~/shared/types'
import { compactQuery } from '../../shared/query'

export function usePublicVenuesRepository() {
  const apiRequest = useApiRequest()

  async function listVenues(
    filters: VenueCatalogFilters,
  ): Promise<PaginatedResponse<PublicVenueListApiItem>> {
    return apiRequest<PaginatedResponse<PublicVenueListApiItem>>('/venues', {
      method: 'GET',
      query: compactQuery({
        page: filters.page,
        limit: 24,
        search: filters.search,
        city: filters.city,
        type: filters.type,
        isActive: filters.isActive,
      }),
    })
  }

  return {
    listVenues,
  }
}
