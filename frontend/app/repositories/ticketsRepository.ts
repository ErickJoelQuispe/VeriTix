import type { TicketDetailApiItem, TicketListApiItem } from '~~/shared/api/tickets'
import type { PaginatedResponse } from '~~/shared/api/types'
import type { UserTicket, UserTicketDetail } from '~~/shared/types'
import { compactQuery } from '~~/shared/query'

const TRAILING_SLASH_RE = /\/$/

function mapTicketListItem(item: TicketListApiItem): UserTicket {
  return {
    id: item.id,
    hash: item.hash,
    status: item.status,
    purchaseDate: item.purchaseDate,
    ticketType: item.ticketType,
    event: item.event,
    orderItem: item.orderItem,
  }
}

function mapTicketDetail(item: TicketDetailApiItem): UserTicketDetail {
  return {
    ...mapTicketListItem(item),
    qrPayload: item.qrPayload,
    validatedAt: item.validatedAt,
    createdAt: item.createdAt,
    order: item.order,
    validatedBy: item.validatedBy,
  }
}

export function useTicketsRepository() {
  const apiRequest = useApiRequest()

  async function listMyTickets(page = 1, limit = 12): Promise<PaginatedResponse<UserTicket>> {
    const response = await apiRequest<PaginatedResponse<TicketListApiItem>>('/tickets/mine', {
      method: 'GET',
      query: compactQuery({ page, limit }),
    })

    return {
      data: response.data.map(mapTicketListItem),
      meta: response.meta,
    }
  }

  async function getTicket(id: string): Promise<UserTicketDetail> {
    const response = await apiRequest<TicketDetailApiItem>(`/tickets/${id}`, {
      method: 'GET',
    })

    return mapTicketDetail(response)
  }

  function getTicketPdfUrl(id: string): string {
    const config = useRuntimeConfig()
    const base = config.public.apiBase.replace(TRAILING_SLASH_RE, '')
    return `${base}/tickets/${id}/pdf`
  }

  return {
    listMyTickets,
    getTicket,
    getTicketPdfUrl,
  }
}
