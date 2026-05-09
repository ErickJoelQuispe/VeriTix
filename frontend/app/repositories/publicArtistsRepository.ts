import type { PublicArtistListApiItem } from '~~/shared/api/public-artists'
import type { PaginatedResponse } from '~~/shared/api/types'
import type { ArtistCatalogFilters } from '~~/shared/types'
import { compactQuery } from '../../shared/query'

export function usePublicArtistsRepository() {
  const apiRequest = useApiRequest()

  async function listArtists(
    filters: ArtistCatalogFilters,
  ): Promise<PaginatedResponse<PublicArtistListApiItem>> {
    return apiRequest<PaginatedResponse<PublicArtistListApiItem>>('/artists', {
      method: 'GET',
      query: compactQuery({
        page: filters.page,
        limit: 24,
        search: filters.search,
        genreId: filters.genreId,
        country: filters.country,
        isActive: filters.isActive,
      }),
    })
  }

  return {
    listArtists,
  }
}
