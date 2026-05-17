import type { TicketType } from '~~/shared/types/domain'

export function useTicketTypesRepository() {
  const apiRequest = useApiRequest()

  async function getByEvent(eventId: string): Promise<TicketType[]> {
    return apiRequest<TicketType[]>(`/api/events/${eventId}/ticket-types`, {
      method: 'GET',
    })
  }

  return {
    getByEvent,
  }
}
