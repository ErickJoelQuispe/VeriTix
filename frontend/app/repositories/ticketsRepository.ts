import type { UserTicket, UserTicketDetail } from '~~/shared/types'
import type { PaginatedResponse } from '~~/shared/api/types'

export function useTicketsRepository() {
  const apiRequest = useApiRequest()

  /**
   * GET /tickets/mine
   * Returns paginated list of the authenticated buyer's tickets.
   */
  async function listMyTickets(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<UserTicket>> {
    return apiRequest<PaginatedResponse<UserTicket>>('/tickets/mine', {
      query: { page, limit },
    })
  }

  /**
   * GET /tickets/:id
   * Returns full ticket detail including qrPayload (owner or admin only).
   */
  async function getTicketDetail(id: string): Promise<UserTicketDetail> {
    return apiRequest<UserTicketDetail>(`/tickets/${id}`)
  }

  return {
    listMyTickets,
    getTicketDetail,
  }
}
