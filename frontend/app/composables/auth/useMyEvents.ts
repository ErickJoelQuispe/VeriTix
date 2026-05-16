import type { PaginatedResponse } from '~~/shared/api/types'
import type { MyEventItem } from '~~/shared/types'
import { normalizeApiError } from '@/utils/apiError'
import { useMyEventsRepository } from '@/repositories/myEventsRepository'

export function useMyEvents() {
  const { listMyEvents } = useMyEventsRepository()
  const { getApiErrorMessage, getApiErrorStatus, isApiSessionExpiredError } = useApiErrorMessage()

  const events = ref<MyEventItem[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyEvents(params: {
    upcoming?: boolean
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<MyEventItem>> {
    isLoading.value = true
    error.value = null

    try {
      const response = await listMyEvents(params)
      events.value = response.data
      total.value = response.meta.total
      return response
    }
    catch (err) {
      error.value = getApiErrorMessage(err, 'No pudimos cargar tus eventos.')
      normalizeApiError(err, 'No pudimos cargar tus eventos.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    events,
    total,
    isLoading,
    error,
    fetchMyEvents,
  }
}
