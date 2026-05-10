import type { MaybeRef } from 'vue'
import type { PublicVenueListApiItem } from '~~/shared/api/public-venues'
import type { PaginatedResponse } from '~~/shared/api/types'
import type { VenueCatalogFilters } from '~~/shared/types'
import { usePublicVenuesRepository } from '../../repositories/publicVenuesRepository'

export function normalizeVenueFilters(
  raw?: Partial<VenueCatalogFilters>,
): VenueCatalogFilters {
  return {
    search: raw?.search?.trim() ?? '',
    city: raw?.city?.trim() ?? '',
    type: raw?.type?.trim() ?? '',
    isActive: raw?.isActive?.trim() ?? '',
    page: raw?.page && raw.page > 0 ? raw.page : 1,
  }
}

export function usePublicVenues(
  filters?: MaybeRef<Partial<VenueCatalogFilters> | undefined>,
) {
  const { listVenues } = usePublicVenuesRepository()

  const normalizedFilters = computed(() => {
    return normalizeVenueFilters(unref(filters))
  })

  const cacheKey = computed(() => {
    return `veritix-public-venues:${JSON.stringify(normalizedFilters.value)}`
  })

  return useAsyncData<PaginatedResponse<PublicVenueListApiItem>>(
    cacheKey,
    async () => listVenues(normalizedFilters.value),
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
