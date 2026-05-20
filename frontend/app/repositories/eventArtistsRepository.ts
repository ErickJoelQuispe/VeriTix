import type { EventArtistEntry } from '~~/shared/types'

export interface AddArtistParams {
  artistId: string
  role: 'HEADLINER' | 'SPECIAL_GUEST' | 'OPENER'
  performanceOrder: number
}

export function useEventArtistsRepository() {
  const apiRequest = useApiRequest()

  async function listByEvent(eventId: string): Promise<EventArtistEntry[]> {
    return apiRequest<EventArtistEntry[]>(`/admin/events/${eventId}/artists`, {
      method: 'GET',
    })
  }

  async function addToEvent(eventId: string, params: AddArtistParams): Promise<EventArtistEntry> {
    return apiRequest<EventArtistEntry, AddArtistParams>(`/admin/events/${eventId}/artists`, {
      method: 'POST',
      body: params,
    })
  }

  async function removeFromEvent(eventId: string, artistEntryId: string): Promise<void> {
    await apiRequest(`/admin/events/${eventId}/artists/${artistEntryId}`, {
      method: 'DELETE',
    })
  }

  return { listByEvent, addToEvent, removeFromEvent }
}
