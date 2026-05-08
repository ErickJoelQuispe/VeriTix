import type {
  BackofficeEventDetail,
  BackofficeEventPayload,
  BackofficeEventRecord,
  BackofficeOption,
  BackofficeRequiresAttentionRecord,
} from '~~/shared/types/backoffice'
import type { PaginatedResponse as ApiPaginatedResponse } from '~~/shared/types/api'
import type { PaginatedResponse as DomainPaginatedResponse } from '~~/shared/types/domain'
import type { GenreOption, VenueOption } from '~~/shared/types/domain'
import type { CatalogFilters, QuickWindow } from '~/utils/backoffice/eventsCatalog'
import { buildCatalogQuery } from '~/utils/backoffice/eventsCatalog'

export function useBackofficeEventsRepository() {
  const apiRequest = useApiRequest()
  const { requireBackofficeHeaders } = useBackofficeApi()

  async function getFormOptions(): Promise<{
    venues: VenueOption[]
    genres: GenreOption[]
    formats: BackofficeOption[]
  }> {
    const [venuesResponse, genresResponse, formatsResponse] = await Promise.all([
      apiRequest<DomainPaginatedResponse<VenueOption>>('/venues', { method: 'GET' }),
      apiRequest<GenreOption[]>('/genres', { method: 'GET' }),
      apiRequest<BackofficeOption[]>('/concert-formats', { method: 'GET' }),
    ])

    return {
      venues: venuesResponse?.data ?? [],
      genres: genresResponse ?? [],
      formats: formatsResponse ?? [],
    }
  }

  async function listCatalog({
    pageValue,
    pageSize,
    filters,
    quickWindow,
  }: {
    pageValue: number
    pageSize: number
    filters: CatalogFilters
    quickWindow: QuickWindow
  }): Promise<ApiPaginatedResponse<BackofficeEventRecord>> {
    return apiRequest<ApiPaginatedResponse<BackofficeEventRecord>>('/admin/events', {
      method: 'GET',
      headers: requireBackofficeHeaders(),
      query: buildCatalogQuery({
        pageValue,
        pageSize,
        filters,
        quickWindow,
      }),
    })
  }

  async function listRequiresAttention(): Promise<BackofficeRequiresAttentionRecord[]> {
    return apiRequest<BackofficeRequiresAttentionRecord[]>('/admin/events/requires-attention', {
      method: 'GET',
      headers: requireBackofficeHeaders(),
    })
  }

  async function getEvent(eventId: string): Promise<BackofficeEventDetail> {
    return apiRequest<BackofficeEventDetail>(`/admin/events/${eventId}`, {
      method: 'GET',
      headers: requireBackofficeHeaders(),
    })
  }

  async function createEvent(payload: BackofficeEventPayload): Promise<BackofficeEventDetail> {
    return apiRequest<BackofficeEventDetail, BackofficeEventPayload>('/admin/events', {
      method: 'POST',
      headers: requireBackofficeHeaders(),
      body: payload,
    })
  }

  async function updateEvent(eventId: string, payload: BackofficeEventPayload): Promise<BackofficeEventDetail> {
    return apiRequest<BackofficeEventDetail, BackofficeEventPayload>(`/admin/events/${eventId}`, {
      method: 'PATCH',
      headers: requireBackofficeHeaders(),
      body: payload,
    })
  }

  async function deleteEvent(eventId: string): Promise<void> {
    await apiRequest(`/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: requireBackofficeHeaders(),
    })
  }

  return {
    getFormOptions,
    listCatalog,
    listRequiresAttention,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
  }
}
