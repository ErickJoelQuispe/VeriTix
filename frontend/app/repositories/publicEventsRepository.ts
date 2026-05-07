import type {
  CurrencyCode,
  EventCatalogDetail,
  EventCatalogFilters,
  EventCatalogItem,
  GenreOption,
  PaginatedResponse,
  VenueOption,
} from '~/types'

interface EventListApiItem {
  id: string
  name: string
  eventDate: string | Date
  imageUrl: string | null
  currency: string
  venue: {
    id: string
    name: string
    city: string
  }
  format: {
    id: string
    name: string
  } | null
}

interface EventDetailApiItem {
  id: string
  name: string
  description: string | null
  eventDate: string | Date
  doorsOpenTime: string | Date | null
  startSale: string | Date | null
  endSale: string | Date | null
  maxCapacity: number
  imageUrl: string | null
  currency: string
  creatorId: string
  venue: {
    id: string
    name: string
    slug: string
    address: string
    city: string
    state: string | null
    country: string
    capacity: number | null
    type: string
    imageUrl: string | null
  }
  format: {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
  } | null
  genres: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function toIsoString(value: string | Date | null | undefined): string | null {
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

export function mapEventListItem(item: EventListApiItem): EventCatalogItem {
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

export function mapEventDetail(item: EventDetailApiItem): EventCatalogDetail {
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

  async function listEvents(filters: EventCatalogFilters): Promise<PaginatedResponse<EventCatalogItem>> {
    const response = await apiRequest<PaginatedResponse<EventListApiItem>>('/events', {
      method: 'GET',
      query: {
        page: filters.page,
        limit: 24,
        city: filters.city || undefined,
        genreId: filters.genreId || undefined,
        search: filters.search || undefined,
      },
    })

    return {
      data: response.data.map(mapEventListItem),
      meta: response.meta,
    }
  }

  async function getEvent(id: string): Promise<EventCatalogDetail> {
    const response = await apiRequest<EventDetailApiItem>(`/events/${id}`, {
      method: 'GET',
    })

    return mapEventDetail(response)
  }

  async function listGenres(): Promise<GenreOption[]> {
    return apiRequest<GenreOption[]>('/genres', {
      method: 'GET',
    })
  }

  async function listVenues(): Promise<VenueOption[]> {
    const response = await apiRequest<PaginatedResponse<VenueOption>>('/venues', {
      method: 'GET',
    })

    return response.data
  }

  return {
    listEvents,
    getEvent,
    listGenres,
    listVenues,
  }
}
