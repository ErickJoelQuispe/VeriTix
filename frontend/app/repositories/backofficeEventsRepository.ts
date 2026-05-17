import type { PaginatedResponse } from '~~/shared/api/types'
import type {
  BackofficeEventDetail,
  BackofficeEventPayload,
  BackofficeEventRecord,
  BackofficeFormatRecord,
  BackofficeOption,
  BackofficeRequiresAttentionRecord,
  GenreOption,
  VenueOption,
} from '~~/shared/types'
import type { CatalogFilters, QuickWindow } from '@/utils/backoffice/eventsCatalog'
import { buildCatalogQuery } from '@/utils/backoffice/eventsCatalog'

export function useBackofficeEventsRepository() {
  const apiRequest = useApiRequest()

  async function getFormOptions(): Promise<{
    venues: VenueOption[]
    genres: GenreOption[]
    formats: BackofficeOption[]
  }> {
    const [venuesResponse, genresResponse, formatsResponse] = await Promise.all([
      apiRequest<PaginatedResponse<VenueOption>>('/venues', { method: 'GET' }),
      apiRequest<GenreOption[]>('/genres', { method: 'GET' }),
      apiRequest<BackofficeFormatRecord[]>('/concert-formats', { method: 'GET' }),
    ])

    return {
      venues: venuesResponse?.data ?? [],
      genres: genresResponse ?? [],
      formats: (formatsResponse ?? []).map((format: BackofficeFormatRecord) => ({ id: format.id, name: format.name })),
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
  }): Promise<PaginatedResponse<BackofficeEventRecord>> {
    return apiRequest<PaginatedResponse<BackofficeEventRecord>>('/admin/events', {
      method: 'GET',
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
    })
  }

  async function getEvent(eventId: string): Promise<BackofficeEventDetail> {
    return apiRequest<BackofficeEventDetail>(`/admin/events/${eventId}`, {
      method: 'GET',
    })
  }

  async function createEvent(payload: BackofficeEventPayload): Promise<BackofficeEventDetail> {
    return apiRequest<BackofficeEventDetail, BackofficeEventPayload>('/admin/events', {
      method: 'POST',
      body: payload,
    })
  }

  async function updateEvent(eventId: string, payload: BackofficeEventPayload): Promise<BackofficeEventDetail> {
    return apiRequest<BackofficeEventDetail, BackofficeEventPayload>(`/admin/events/${eventId}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  async function deleteEvent(eventId: string): Promise<void> {
    await apiRequest(`/admin/events/${eventId}`, {
      method: 'DELETE',
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
