import type { PaginatedResponse } from '~~/shared/api/types'
import type { UserOrder, UserOrderDetail } from '~~/shared/types'
import { normalizeApiError } from '@/utils/apiError'
import { useOrdersRepository } from '@/repositories/ordersRepository'

export function useMyOrders() {
  const { listMyOrders, getOrder } = useOrdersRepository()
  const { getApiErrorMessage, getApiErrorStatus, isApiSessionExpiredError } = useApiErrorMessage()

  async function fetchMyOrders(page = 1, limit = 12): Promise<PaginatedResponse<UserOrder>> {
    try {
      return await listMyOrders(page, limit)
    }
    catch (error) {
      normalizeApiError(error, 'No pudimos cargar tus órdenes.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
  }

  async function fetchOrderDetail(id: string): Promise<UserOrderDetail> {
    try {
      return await getOrder(id)
    }
    catch (error) {
      normalizeApiError(error, 'No pudimos cargar el detalle de la orden.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
  }

  return {
    fetchMyOrders,
    fetchOrderDetail,
  }
}
