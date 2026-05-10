import type { MaybeRef } from 'vue'
import type { PublicArtistListApiItem } from '~~/shared/api/public-artists'
import type { PaginatedResponse } from '~~/shared/api/types'
import type { ArtistCatalogFilters } from '~~/shared/types'
import { usePublicArtistsRepository } from '../../repositories/publicArtistsRepository'

export function normalizeArtistFilters(
  raw?: Partial<ArtistCatalogFilters>,
): ArtistCatalogFilters {
  return {
    search: raw?.search?.trim() ?? '',
    genreId: raw?.genreId?.trim() ?? '',
    country: raw?.country?.trim() ?? '',
    isActive: raw?.isActive?.trim() ?? '',
    page: raw?.page && raw.page > 0 ? raw.page : 1,
  }
}

export function usePublicArtists(
  filters?: MaybeRef<Partial<ArtistCatalogFilters> | undefined>,
) {
  const { listArtists } = usePublicArtistsRepository()

  const normalizedFilters = computed(() => {
    return normalizeArtistFilters(unref(filters))
  })

  const cacheKey = computed(() => {
    return `veritix-public-artists:${JSON.stringify(normalizedFilters.value)}`
  })

  return useAsyncData<PaginatedResponse<PublicArtistListApiItem>>(
    cacheKey,
    async () => listArtists(normalizedFilters.value),
    {
      default: () => ({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 24,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }),
      watch: [normalizedFilters],
      server: true,
    },
  )
}
