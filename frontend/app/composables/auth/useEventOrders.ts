import type { EventOrderListApiItem, EventOrderStatus } from '~~/shared/api/orders'
import type { PaginationMeta } from '~~/shared/api/types'
import { useOrdersRepository } from '@/repositories/ordersRepository'

export function useEventOrders(eventId: MaybeRef<string>) {
  const { listEventOrders } = useOrdersRepository()

  const orders = ref<EventOrderListApiItem[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const statusFilter = ref<EventOrderStatus | undefined>(undefined)
  const page = ref(1)

  async function fetch(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const response = await listEventOrders(unref(eventId), {
        status: statusFilter.value,
        page: page.value,
        limit: 20,
      })
      orders.value = response.data
      meta.value = response.meta
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load event orders'
      error.value = message
    }
    finally {
      isLoading.value = false
    }
  }

  function setPage(p: number): void {
    page.value = p
    fetch()
  }

  function setStatusFilter(s: EventOrderStatus | undefined): void {
    statusFilter.value = s
    page.value = 1
    fetch()
  }

  return {
    orders,
    meta,
    isLoading,
    error,
    statusFilter,
    page,
    fetch,
    setPage,
    setStatusFilter,
  }
}
