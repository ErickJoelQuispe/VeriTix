import type { TicketType } from '~~/shared/types/domain'

export interface TicketTypePayload {
  name: string
  description?: string
  price: number
  totalQuantity: number
  maxPerUser?: number
  isActive?: boolean
  saleStartDate?: string
  saleEndDate?: string
}

export function useTicketTypesRepository() {
  const apiRequest = useApiRequest()

  async function listByEvent(eventId: string): Promise<TicketType[]> {
    return apiRequest<TicketType[]>(`/events/${eventId}/ticket-types`, { method: 'GET' })
  }

  async function create(eventId: string, payload: TicketTypePayload): Promise<TicketType> {
    return apiRequest<TicketType, TicketTypePayload>(`/events/${eventId}/ticket-types`, {
      method: 'POST',
      body: payload,
    })
  }

  async function update(eventId: string, ticketTypeId: string, payload: Partial<TicketTypePayload>): Promise<TicketType> {
    return apiRequest<TicketType, Partial<TicketTypePayload>>(`/events/${eventId}/ticket-types/${ticketTypeId}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  async function remove(eventId: string, ticketTypeId: string): Promise<void> {
    await apiRequest(`/events/${eventId}/ticket-types/${ticketTypeId}`, { method: 'DELETE' })
  }

  return { listByEvent, create, update, remove }
}
