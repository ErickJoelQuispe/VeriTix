import type { UserTicket, UserTicketDetail } from '~~/shared/types'
import type { PaginatedResponse } from '~~/shared/api/types'
import { useTicketsRepository } from '@/repositories/ticketsRepository'

export function useMyTickets() {
  const { listMyTickets, getTicketDetail } = useTicketsRepository()
  const { getApiErrorMessage } = useApiErrorMessage()

  const tickets = ref<UserTicket[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyTickets(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<UserTicket>> {
    isLoading.value = true
    error.value = null

    try {
      const response = await listMyTickets(page, limit)
      tickets.value = response.data
      total.value = response.meta.total
      return response
    }
    catch (err) {
      error.value = getApiErrorMessage(err, 'No pudimos cargar tus entradas.')
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchTicketDetail(id: string): Promise<UserTicketDetail> {
    return getTicketDetail(id)
  }

  return {
    tickets,
    total,
    isLoading,
    error,
    fetchMyTickets,
    fetchTicketDetail,
  }
}
