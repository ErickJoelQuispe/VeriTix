import type { UserOrder, UserOrderDetail } from '~~/shared/types'
import type { PaginatedResponse } from '~~/shared/api/types'

export function useOrdersRepository() {
  const apiRequest = useApiRequest()

  /**
   * GET /orders/my
   * Returns paginated list of the authenticated buyer's orders.
   */
  async function listMyOrders(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<UserOrder>> {
    return apiRequest<PaginatedResponse<UserOrder>>('/orders/my', {
      query: { page, limit },
    })
  }

  /**
   * GET /orders/:id
   * Returns full order detail including items and payments (owner or admin only).
   */
  async function getOrderDetail(id: string): Promise<UserOrderDetail> {
    return apiRequest<UserOrderDetail>(`/orders/${id}`)
  }

  return {
    listMyOrders,
    getOrderDetail,
  }
}
