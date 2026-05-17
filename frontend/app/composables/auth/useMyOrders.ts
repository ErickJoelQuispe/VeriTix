import type { CreateOrderRequest } from '~~/shared/api/orders'
import type { PaginatedResponse } from '~~/shared/api/types'
import type { UserOrder, UserOrderDetail } from '~~/shared/types'
import { normalizeApiError } from '@/utils/apiError'
import { useOrdersRepository } from '@/repositories/ordersRepository'

export function useMyOrders() {
  const { listMyOrders, getOrder, cancelOrder, createOrder: repoCreateOrder } = useOrdersRepository()
  const { getApiErrorMessage, getApiErrorStatus, isApiSessionExpiredError } = useApiErrorMessage()

  const orders = ref<UserOrder[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyOrders(page = 1, limit = 12): Promise<PaginatedResponse<UserOrder>> {
    isLoading.value = true
    error.value = null
    try {
      const response = await listMyOrders(page, limit)
      orders.value = response.data
      total.value = response.meta.total
      return response
    }
    catch (err) {
      normalizeApiError(err, 'No pudimos cargar tus órdenes.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
    finally {
      isLoading.value = false
    }
  }

  async function fetchOrderDetail(id: string): Promise<UserOrderDetail> {
    try {
      return await getOrder(id)
    }
    catch (err) {
      normalizeApiError(err, 'No pudimos cargar el detalle de la orden.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
  }

  async function cancelMyOrder(id: string): Promise<void> {
    return cancelOrder(id)
  }

  async function createOrder(
    payload: CreateOrderRequest,
  ): Promise<UserOrderDetail & { checkoutUrl: string }> {
    try {
      return await repoCreateOrder(payload)
    }
    catch (err) {
      normalizeApiError(err, 'No pudimos crear la orden.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
  }

  return {
    orders,
    total,
    isLoading,
    error,
    fetchMyOrders,
    fetchOrderDetail,
    cancelMyOrder,
    createOrder,
  }
}
