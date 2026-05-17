import type { PaginatedResponse } from '~~/shared/api/types'
import type { UserTicket, UserTicketDetail } from '~~/shared/types'
import { normalizeApiError } from '@/utils/apiError'
import { useTicketsRepository } from '@/repositories/ticketsRepository'

export function useMyTickets() {
  const { listMyTickets, getTicket, getTicketPdfUrl } = useTicketsRepository()
  const { getApiErrorMessage, getApiErrorStatus, isApiSessionExpiredError } = useApiErrorMessage()

  const tickets = ref<UserTicket[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyTickets(page = 1, limit = 12): Promise<PaginatedResponse<UserTicket>> {
    isLoading.value = true
    error.value = null
    try {
      const response = await listMyTickets(page, limit)
      tickets.value = response.data
      total.value = response.meta.total
      return response
    }
    catch (err) {
      normalizeApiError(err, 'No pudimos cargar tus entradas.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchTicketDetail(id: string): Promise<UserTicketDetail> {
    try {
      return await getTicket(id)
    }
    catch (err) {
      normalizeApiError(err, 'No pudimos cargar el detalle de la entrada.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
  }

  return {
    tickets,
    total,
    isLoading,
    error,
    fetchMyTickets,
    fetchTicketDetail,
    getTicketPdfUrl,
  }
}
