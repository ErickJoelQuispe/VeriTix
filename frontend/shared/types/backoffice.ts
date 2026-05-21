import type {
  CurrencyCode,
  EventFormatDetail,
  EventGenreSummary,
  EventVenueDetail,
  EventVenueSummary,
  GenreOption,
} from './domain'
import type { UserRole } from './user'

export interface BackofficeOption {
  id: string
  name: string
}

export type BackofficeFilterVisibility = 'city' | 'artistName' | 'pageSize' | 'genre' | 'format' | 'role' | 'status' | 'dateRange'

export interface BackofficeFilterOption {
  label: string
  value: string | number
}

export interface BackofficeFilterFieldControl {
  key: string
  kind: 'field'
  name: string
  label: string
  modelValue: string
  placeholder?: string
  icon?: string
  type?: string
  disabled?: boolean
  onUpdate: (value: string) => void
}

export interface BackofficeFilterSelectControl {
  key: string
  kind: 'select'
  name: string
  label: string
  modelValue: string | number
  items: BackofficeFilterOption[]
  size?: 'sm' | 'md' | 'lg'
  placeholderValue?: string | number
  icon?: string
  disabled?: boolean
  onUpdate: (value: string | number) => void
}

export type BackofficeFilterControl = BackofficeFilterFieldControl | BackofficeFilterSelectControl

export interface BackofficeEventRecord {
  id: string
  name: string
  eventDate: string
  status: string
  imageUrl: string | null
  currency: CurrencyCode
  venue: EventVenueSummary
  format: BackofficeOption | null
}

export interface BackofficeEventDetail {
  id: string
  name: string
  description: string | null
  eventDate: string
  doorsOpenTime: string | null
  startSale: string | null
  endSale: string | null
  maxCapacity: number
  status: string
  imageUrl: string | null
  currency: CurrencyCode
  creatorId: string
  createdAt: string
  updatedAt: string
  venue: EventVenueDetail
  format: EventFormatDetail | null
  genres: EventGenreSummary[]
}

export type ArtistRole = 'HEADLINER' | 'SPECIAL_GUEST' | 'OPENER'

export interface EventArtistSummary {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  country: string | null
}

export interface EventArtistEntry {
  id: string
  role: ArtistRole
  performanceOrder: number
  performanceTime: string | Date | null
  eventId: string
  artist: EventArtistSummary
}

export interface BackofficeEventPayload {
  name: string
  description?: string
  eventDate: string
  doorsOpenTime?: string
  startSale?: string
  endSale?: string
  maxCapacity: number
  venueId: string
  imageUrl?: string
  currency?: CurrencyCode
  formatId?: string
  genreIds?: string[]
}

export interface BackofficeUpcomingEventRecord {
  id: string
  name: string
  eventDate: string
  venue: EventVenueSummary
  ticketsSold: number
  totalCapacity: number
}

export interface BackofficeRequiresAttentionRecord {
  id: string
  name: string
  status: string
  eventDate: string | null
  imageUrl: string | null
  issues: string[]
}

export interface BackofficeTopEventRecord extends BackofficeUpcomingEventRecord {
  revenue: number
}

export interface BackofficeEventMetricsTicketType {
  name: string
  sold: number
  revenue: number
}

export interface BackofficeEventMetrics {
  eventId: string
  eventName: string
  status: string
  capacity: {
    total: number
    sold: number
    available: number
    occupancyRate: number
  }
  revenue: {
    total: number
    byTicketType: BackofficeEventMetricsTicketType[]
  }
  orders: {
    total: number
    completed: number
    pending: number
    cancelled: number
    refunded: number
  }
  topTicketType: {
    name: string
    sold: number
  } | null
}

export interface BackofficeUserRecord {
  id: string
  email: string
  phone: string
  name: string
  lastName: string
  role: UserRole
  avatarUrl: string | null
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface BackofficeCreateUserPayload {
  email: string
  phone: string
  name: string
  lastName: string
  password: string
  role?: UserRole
}

export interface BackofficeUpdateUserPayload {
  email?: string
  phone?: string
  name?: string
  lastName?: string
  avatarUrl?: string
  role?: UserRole
  isActive?: boolean
  emailVerified?: boolean
}

export interface BackofficeArtistRecord {
  id: string
  name: string
  slug: string
  bio: string | null
  imageUrl: string | null
  country: string | null
  website: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  genres: EventGenreSummary[]
}

export interface BackofficeFormatRecord {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
}

export type BackofficeGenreRecord = GenreOption

export interface BackofficeGenrePayload {
  name: string
  slug: string
  description?: string
}

export interface BackofficeConcertFormatPayload {
  name: string
  slug: string
  description?: string
  icon?: string
}

export interface BackofficeArtistPayload {
  name: string
  slug: string
  bio?: string
  imageUrl?: string
  country?: string
  website?: string
  isActive?: boolean
  genreIds?: string[]
}

export type VenueType = 'ESTADIO' | 'ARENA' | 'FORO' | 'AUDITORIO' | 'CLUB' | 'TEATRO' | 'AL_AIRE_LIBRE' | 'OTRO'

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  ESTADIO: 'Estadio',
  ARENA: 'Arena',
  FORO: 'Foro',
  AUDITORIO: 'Auditorio',
  CLUB: 'Club',
  TEATRO: 'Teatro',
  AL_AIRE_LIBRE: 'Al aire libre',
  OTRO: 'Otro',
}

export interface BackofficeVenueRecord {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: string | null
  country: string
  capacity: number | null
  type: VenueType
  isActive: boolean
  imageUrl: string | null
  website: string | null
  createdAt: string
  updatedAt: string
}

export interface BackofficeVenuePayload {
  name: string
  slug: string
  address: string
  city: string
  state?: string | null
  country?: string
  capacity?: number | null
  type?: VenueType
  isActive?: boolean
  imageUrl?: string | null
  website?: string | null
}

export interface BackofficeVenueListQuery {
  pageValue: number
  pageSize: number
  search: string
  city: string
  isActive: string
}
