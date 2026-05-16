import type { UserOrder, UserOrderDetail } from '~~/shared/types'
import type { PaginatedResponse } from '~~/shared/api/types'
import { useOrdersRepository } from '@/repositories/ordersRepository'

export function useMyOrders() {
  const { listMyOrders, getOrderDetail, cancelOrder } = useOrdersRepository()
  const { getApiErrorMessage } = useApiErrorMessage()

  const orders = ref<UserOrder[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyOrders(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<UserOrder>> {
    isLoading.value = true
    error.value = null

    try {
      const response = await listMyOrders(page, limit)
      orders.value = response.data
      total.value = response.meta.total
      return response
    }
    catch (err) {
      error.value = getApiErrorMessage(err, 'No pudimos cargar tus órdenes.')
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchOrderDetail(id: string): Promise<UserOrderDetail> {
    return getOrderDetail(id)
  }

  async function cancelMyOrder(id: string): Promise<void> {
    return cancelOrder(id)
  }

  return {
    orders,
    total,
    isLoading,
    error,
    fetchMyOrders,
    fetchOrderDetail,
    cancelMyOrder,
  }
}
