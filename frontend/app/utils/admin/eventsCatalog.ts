import type {
  AdminEventRecord,
  AdminRequiresAttentionRecord,
  PaginatedMeta,
} from '~/types'

export type QuickWindow = 'all' | 'upcoming' | 'thisMonth' | 'past'
export type EventBadgeColor = 'success' | 'warning' | 'error' | 'neutral'
export type CatalogMode = 'published' | 'review'

export interface CatalogEventListItem {
  id: string
  title: string
  to: string
  eventDate: string | null
  status: string
  imageUrl: string | null
  venueName: string
  venueCity: string
  formatName: string
  issues: string[]
  isReview: boolean
}

export interface CatalogFilters {
  search: string
  city: string
  genreId: string
  formatId: string
  dateFrom: string
  dateTo: string
}

export const QUICK_WINDOW_OPTIONS: Array<{ value: QuickWindow, label: string }> = [
  { value: 'all', label: 'Todo' },
  { value: 'upcoming', label: 'Próximos' },
  { value: 'thisMonth', label: 'Este mes' },
  { value: 'past', label: 'Histórico' },
]

export const CATALOG_MODE_ITEMS: Array<{ value: CatalogMode, label: string, icon: string }> = [
  { value: 'published', label: 'Publicados', icon: 'i-lucide-store' },
  { value: 'review', label: 'Revisión', icon: 'i-lucide-siren' },
]

export function isQuickWindow(value: string): value is QuickWindow {
  return value === 'all' || value === 'upcoming' || value === 'thisMonth' || value === 'past'
}

export function isCatalogMode(value: string): value is CatalogMode {
  return value === 'published' || value === 'review'
}

function toStartOfDayIso(value: string): string | undefined {
  if (!value) {
    return undefined
  }

  return new Date(`${value}T00:00:00`).toISOString()
}

function toEndOfDayIso(value: string): string | undefined {
  if (!value) {
    return undefined
  }

  return new Date(`${value}T23:59:59`).toISOString()
}

function getQuickWindowRange(quickWindow: QuickWindow): { dateFrom?: string, dateTo?: string } {
  const now = new Date()

  if (quickWindow === 'upcoming') {
    return { dateFrom: now.toISOString() }
  }

  if (quickWindow === 'past') {
    return { dateTo: now.toISOString() }
  }

  if (quickWindow === 'thisMonth') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return { dateFrom: monthStart.toISOString(), dateTo: monthEnd.toISOString() }
  }

  return {}
}

export function buildCatalogQuery({
  pageValue,
  pageSize,
  filters,
  quickWindow,
}: {
  pageValue: number
  pageSize: number
  filters: CatalogFilters
  quickWindow: QuickWindow
}) {
  const quickRange = !filters.dateFrom && !filters.dateTo
    ? getQuickWindowRange(quickWindow)
    : {}

  return {
    page: pageValue,
    limit: pageSize,
    search: filters.search.trim() || undefined,
    city: filters.city.trim() || undefined,
    genreId: filters.genreId || undefined,
    formatId: filters.formatId || undefined,
    dateFrom: toStartOfDayIso(filters.dateFrom) ?? quickRange.dateFrom,
    dateTo: toEndOfDayIso(filters.dateTo) ?? quickRange.dateTo,
  }
}

export function getEventStatusColor(status: string): EventBadgeColor {
  if (status === 'PUBLISHED') {
    return 'success'
  }
  if (status === 'DRAFT') {
    return 'warning'
  }
  if (status === 'CANCELLED') {
    return 'error'
  }

  return 'neutral'
}

export function createCatalogListItems({
  catalogMode,
  catalogEvents,
  requiresAttention,
}: {
  catalogMode: CatalogMode
  catalogEvents: AdminEventRecord[]
  requiresAttention: AdminRequiresAttentionRecord[]
}): CatalogEventListItem[] {
  if (catalogMode === 'review') {
    const publishedById = new Map(catalogEvents.map(event => [event.id, event]))

    return requiresAttention.map((event) => {
      const publishedMatch = publishedById.get(event.id)

      return {
        id: event.id,
        title: event.name,
        to: `/admin/events/${event.id}/edit`,
        eventDate: event.eventDate,
        status: event.status,
        imageUrl: publishedMatch?.imageUrl ?? null,
        venueName: publishedMatch?.venue.name ?? '',
        venueCity: publishedMatch?.venue.city ?? '',
        formatName: publishedMatch?.format?.name ?? '',
        issues: event.issues,
        isReview: true,
      }
    })
  }

  return catalogEvents.map(event => ({
    id: event.id,
    title: event.name,
    to: `/admin/events/${event.id}/edit`,
    eventDate: event.eventDate,
    status: event.status,
    imageUrl: event.imageUrl,
    venueName: event.venue.name,
    venueCity: event.venue.city,
    formatName: event.format?.name ?? '',
    issues: [],
    isReview: false,
  }))
}

export function buildCatalogSummary({
  catalogMode,
  requiresAttentionCount,
  meta,
}: {
  catalogMode: CatalogMode
  requiresAttentionCount: number
  meta: PaginatedMeta
}) {
  if (catalogMode === 'review') {
    if (requiresAttentionCount === 0) {
      return 'No hay eventos pendientes de revisión.'
    }

    return `${requiresAttentionCount} eventos requieren revisión.`
  }

  if (meta.total === 0) {
    return 'No hay eventos publicados para la combinación actual.'
  }

  const start = (meta.page - 1) * meta.limit + 1
  const end = Math.min(meta.page * meta.limit, meta.total)

  return `Mostrando ${start}-${end} de ${meta.total} eventos publicados.`
}
