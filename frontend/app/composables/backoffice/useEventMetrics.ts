import type { BackofficeEventMetrics } from '~~/shared/types'

export function useEventMetrics(eventId: MaybeRefOrGetter<string>) {
  const apiRequest = useApiRequest()

  const metrics = ref<BackofficeEventMetrics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const avgTicketPrice = computed<number>(() => {
    const completed = metrics.value?.orders.completed ?? 0
    const total = metrics.value?.revenue.total ?? 0
    return completed > 0 ? total / completed : 0
  })

  async function fetch(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const id = toValue(eventId)
      metrics.value = await apiRequest<BackofficeEventMetrics>(`/admin/events/${id}/metrics`, {
        method: 'GET',
      })
    }
    catch (err: unknown) {
      metrics.value = null
      error.value = err instanceof Error ? err.message : 'No se pudieron cargar las métricas'
    }
    finally {
      isLoading.value = false
    }
  }

  onMounted(() => void fetch())

  return {
    metrics,
    isLoading,
    error,
    avgTicketPrice,
    fetch,
  }
}
