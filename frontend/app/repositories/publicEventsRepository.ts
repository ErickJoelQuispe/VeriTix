import type {
  PublicEventArtistApiItem,
  PublicEventDetailApiItem,
  PublicEventListApiItem,
} from '~~/shared/api/public-events'
import type { PublicVenueListApiItem } from '~~/shared/api/public-venues'
import type { PaginatedResponse } from '~~/shared/api/types'
import type {
  CurrencyCode,
  EventCatalogDetail,
  EventCatalogFilters,
  EventCatalogItem,
  GenreOption,
  VenueOption,
} from '~~/shared/types'
import { compactQuery } from '../../shared/query'

export function toIsoString(
  value: string | Date | null | undefined,
): string | null {
  if (!value) {
    return null
  }

  return typeof value === 'string' ? value : value.toISOString()
}

export function buildFallbackImage(seed: string): string {
  return `https://picsum.photos/seed/${seed}/900/1200`
}

export function buildEventFallbackImage(eventId: string): string {
  return buildFallbackImage(`veritix-event-${eventId}`)
}

export function normalizeCurrencyCode(value: string): CurrencyCode {
  if (value === 'USD' || value === 'EUR' || value === 'COP') {
    return value
  }

  return 'EUR'
}

export function mapEventListItem(
  item: PublicEventListApiItem,
): EventCatalogItem {
  return {
    id: item.id,
    name: item.name,
    dateISO: toIsoString(item.eventDate) ?? new Date().toISOString(),
    imageUrl: item.imageUrl ?? buildEventFallbackImage(item.id),
    currency: normalizeCurrencyCode(item.currency),
    venue: item.venue,
    format: item.format,
  }
}

export function mapEventDetail(
  item: PublicEventDetailApiItem,
): EventCatalogDetail {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    dateISO: toIsoString(item.eventDate) ?? new Date().toISOString(),
    doorsOpenISO: toIsoString(item.doorsOpenTime),
    startSaleISO: toIsoString(item.startSale),
    endSaleISO: toIsoString(item.endSale),
    maxCapacity: item.maxCapacity,
    imageUrl: item.imageUrl ?? buildEventFallbackImage(item.id),
    currency: normalizeCurrencyCode(item.currency),
    creatorId: item.creatorId,
    venue: item.venue,
    format: item.format,
    genres: item.genres,
  }
}

export function usePublicEventsRepository() {
  const apiRequest = useApiRequest()

  async function listEvents(
    filters: EventCatalogFilters,
  ): Promise<PaginatedResponse<EventCatalogItem>> {
    const response = await apiRequest<
      PaginatedResponse<PublicEventListApiItem>
    >('/events', {
      method: 'GET',
      query: compactQuery({
        page: filters.page,
        limit: 24,
        city: filters.city,
        genreId: filters.genreId,
        search: filters.search,
        artistName: filters.artistName,
        venueName: filters.venueName,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }),
    })

    return {
      data: response.data.map(mapEventListItem),
      meta: response.meta,
    }
  }

  async function getEvent(id: string): Promise<EventCatalogDetail> {
    const response = await apiRequest<PublicEventDetailApiItem>(
      `/events/${id}`,
      {
        method: 'GET',
      },
    )

    return mapEventDetail(response)
  }

  async function listGenres(): Promise<GenreOption[]> {
    return apiRequest<GenreOption[]>('/genres', {
      method: 'GET',
    })
  }

  async function listVenues(): Promise<VenueOption[]> {
    const response = await apiRequest<PaginatedResponse<PublicVenueListApiItem>>(
      '/venues',
      {
        method: 'GET',
        query: compactQuery({
          page: 1,
          limit: 100,
          isActive: true,
        }),
      },
    )

    return response.data.map(venue => ({
      id: venue.id,
      name: venue.name,
      city: venue.city,
    }))
  }

  async function listEventArtists(
    eventId: string,
  ): Promise<PublicEventArtistApiItem[]> {
    return apiRequest<PublicEventArtistApiItem[]>(`/events/${eventId}/artists`, {
      method: 'GET',
    })
  }

  return {
    listEvents,
    getEvent,
    listGenres,
    listVenues,
    listEventArtists,
  }
}
