import type { PaginatedResponse } from '~~/shared/api/types'
import type { UserTicket, UserTicketDetail } from '~~/shared/types'
import { normalizeApiError } from '@/utils/apiError'
import { useTicketsRepository } from '@/repositories/ticketsRepository'

export function useMyTickets() {
  const { listMyTickets, getTicket } = useTicketsRepository()
  const { getApiErrorMessage, getApiErrorStatus, isApiSessionExpiredError } = useApiErrorMessage()

  async function fetchMyTickets(page = 1, limit = 12): Promise<PaginatedResponse<UserTicket>> {
    try {
      return await listMyTickets(page, limit)
    }
    catch (error) {
      normalizeApiError(error, 'No pudimos cargar tus entradas.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
  }

  async function fetchTicketDetail(id: string): Promise<UserTicketDetail> {
    try {
      return await getTicket(id)
    }
    catch (error) {
      normalizeApiError(error, 'No pudimos cargar el detalle de la entrada.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
  }

  function getTicketPdfUrl(id: string): string {
    const config = useRuntimeConfig()
    const base = config.public.apiBase.replace(/\/$/, '')
    return `${base}/tickets/${id}/pdf`
  }

  return {
    fetchMyTickets,
    fetchTicketDetail,
    getTicketPdfUrl,
  }
}
