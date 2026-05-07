import type { MaybeRef } from 'vue'
import type {
  EventCatalogDetail,
  EventCatalogFilters,
  EventCatalogItem,
  GenreOption,
  PaginatedResponse,
  VenueOption,
} from '~/types'
import { usePublicEventsRepository } from '../repositories/publicEventsRepository'

export { buildEventFallbackImage, buildFallbackImage, mapEventDetail, mapEventListItem, normalizeCurrencyCode, toIsoString } from '../repositories/publicEventsRepository'

export function normalizeFilters(raw?: Partial<EventCatalogFilters>): EventCatalogFilters {
  return {
    search: raw?.search?.trim() ?? '',
    genreId: raw?.genreId?.trim() ?? '',
    city: raw?.city?.trim() ?? '',
    page: raw?.page && raw.page > 0 ? raw.page : 1,
  }
}

export function usePublicEvents(filters?: MaybeRef<Partial<EventCatalogFilters> | undefined>) {
  const { listEvents } = usePublicEventsRepository()

  const normalizedFilters = computed(() => {
    return normalizeFilters(unref(filters))
  })

  const cacheKey = computed(() => {
    return `veritix-public-events:${JSON.stringify(normalizedFilters.value)}`
  })

  return useAsyncData<PaginatedResponse<EventCatalogItem>>(
    cacheKey,
    async () => listEvents(normalizedFilters.value),
    {
      default: () => ({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 24,
          totalPages: 0,
        },
      }),
      watch: [normalizedFilters],
      server: true,
    },
  )
}

export function usePublicEvent(id: MaybeRef<string>) {
  const { getEvent } = usePublicEventsRepository()

  const eventId = computed(() => unref(id))

  return useAsyncData<EventCatalogDetail>(
    () => `veritix-public-event:${eventId.value}`,
    async () => getEvent(eventId.value),
    {
      watch: [eventId],
      server: true,
    },
  )
}

export function useEventCatalogFilters() {
  const { listGenres, listVenues } = usePublicEventsRepository()

  const genres = useAsyncData<GenreOption[]>(
    'veritix-event-genres',
    async () => listGenres(),
    {
      default: () => [],
      server: true,
    },
  )

  const venues = useAsyncData<VenueOption[]>(
    'veritix-event-venues',
    async () => listVenues(),
    {
      default: () => [],
      server: true,
    },
  )

  const cities = computed(() => {
    return [...new Set((venues.data.value ?? []).map(venue => venue.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'))
  })

  return {
    genres,
    cities,
  }
}
