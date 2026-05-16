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

  /**
   * PATCH /orders/:id/cancel
   * Cancels a PENDING order (owner or admin only). Returns 204 No Content.
   */
  async function cancelOrder(id: string): Promise<void> {
    return apiRequest<void>(`/orders/${id}/cancel`, { method: 'PATCH' })
  }

  return {
    listMyOrders,
    getOrderDetail,
    cancelOrder,
  }
}
