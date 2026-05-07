import type {
  AdminEventDetail,
  AdminEventPayload,
  AdminEventRecord,
  AdminOption,
  AdminRequiresAttentionRecord,
  GenreOption,
  PaginatedResponse,
  VenueOption,
} from '~/types'
import type { CatalogFilters, QuickWindow } from '~/utils/admin/eventsCatalog'
import { buildCatalogQuery } from '~/utils/admin/eventsCatalog'

export function useAdminEventsRepository() {
  const apiRequest = useApiRequest()
  const { requireAdminHeaders } = useAdminApi()

  async function getFormOptions(): Promise<{
    venues: VenueOption[]
    genres: GenreOption[]
    formats: AdminOption[]
  }> {
    const [venuesResponse, genresResponse, formatsResponse] = await Promise.all([
      apiRequest<PaginatedResponse<VenueOption>>('/venues', { method: 'GET' }),
      apiRequest<GenreOption[]>('/genres', { method: 'GET' }),
      apiRequest<AdminOption[]>('/concert-formats', { method: 'GET' }),
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
  }): Promise<PaginatedResponse<AdminEventRecord>> {
    return apiRequest<PaginatedResponse<AdminEventRecord>>('/admin/events', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: buildCatalogQuery({
        pageValue,
        pageSize,
        filters,
        quickWindow,
      }),
    })
  }

  async function listRequiresAttention(): Promise<AdminRequiresAttentionRecord[]> {
    return apiRequest<AdminRequiresAttentionRecord[]>('/admin/events/requires-attention', {
      method: 'GET',
      headers: requireAdminHeaders(),
    })
  }

  async function getEvent(eventId: string): Promise<AdminEventDetail> {
    return apiRequest<AdminEventDetail>(`/admin/events/${eventId}`, {
      method: 'GET',
      headers: requireAdminHeaders(),
    })
  }

  async function createEvent(payload: AdminEventPayload): Promise<AdminEventDetail> {
    return apiRequest<AdminEventDetail, AdminEventPayload>('/admin/events', {
      method: 'POST',
      headers: requireAdminHeaders(),
      body: payload,
    })
  }

  async function updateEvent(eventId: string, payload: AdminEventPayload): Promise<AdminEventDetail> {
    return apiRequest<AdminEventDetail, AdminEventPayload>(`/admin/events/${eventId}`, {
      method: 'PATCH',
      headers: requireAdminHeaders(),
      body: payload,
    })
  }

  async function deleteEvent(eventId: string): Promise<void> {
    await apiRequest(`/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: requireAdminHeaders(),
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
