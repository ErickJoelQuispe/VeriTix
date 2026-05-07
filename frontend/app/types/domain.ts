export type CurrencyCode = 'USD' | 'EUR' | 'COP'

export interface Money {
  amount: number
  currency: CurrencyCode
}

export interface Genre {
  id: string
  slug: string
  name: string
  icon: string
  accent: string
}

export interface PaginatedMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginatedMeta
}

export interface EventVenueSummary {
  id: string
  name: string
  city: string
}

export interface EventFormatSummary {
  id: string
  name: string
}

export interface EventCatalogItem {
  id: string
  name: string
  dateISO: string
  imageUrl: string | null
  currency: CurrencyCode
  venue: EventVenueSummary
  format: EventFormatSummary | null
}

export interface EventGenreSummary {
  id: string
  name: string
  slug: string
}

export interface EventVenueDetail extends EventVenueSummary {
  slug: string
  address: string
  state: string | null
  country: string
  capacity: number | null
  type: string
  imageUrl: string | null
}

export interface EventFormatDetail extends EventFormatSummary {
  slug: string
  description: string | null
  icon: string | null
}

export interface EventCatalogDetail {
  id: string
  name: string
  description: string | null
  dateISO: string
  doorsOpenISO: string | null
  startSaleISO: string | null
  endSaleISO: string | null
  maxCapacity: number
  imageUrl: string | null
  currency: CurrencyCode
  creatorId: string
  venue: EventVenueDetail
  format: EventFormatDetail | null
  genres: EventGenreSummary[]
}

export interface EventCatalogFilters {
  search: string
  genreId: string
  city: string
  page: number
}

export interface GenreOption {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface VenueOption {
  id: string
  name: string
  city: string
}
