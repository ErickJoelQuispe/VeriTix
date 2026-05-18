import type { CreateOrderRequest, CreateOrderResponse, OrderDetailApiItem, OrderListApiItem } from '~~/shared/api/orders'
import type { PaginatedResponse } from '~~/shared/api/types'
import type { UserOrder, UserOrderDetail } from '~~/shared/types'
import { compactQuery } from '~~/shared/query'

function mapOrderListItem(item: OrderListApiItem): UserOrder {
  return {
    id: item.id,
    totalAmount: item.totalAmount,
    status: item.status,
    createdAt: item.createdAt,
    event: item.event,
    checkoutUrl: item.checkoutUrl,
  }
}

function mapOrderDetail(item: OrderDetailApiItem): UserOrderDetail {
  return {
    ...mapOrderListItem(item),
    updatedAt: item.updatedAt,
    event: item.event,
    items: item.items,
    payments: item.payments,
  }
}

export function useOrdersRepository() {
  const apiRequest = useApiRequest()

  async function listMyOrders(page = 1, limit = 12): Promise<PaginatedResponse<UserOrder>> {
    const response = await apiRequest<PaginatedResponse<OrderListApiItem>>('/orders/my', {
      method: 'GET',
      query: compactQuery({ page, limit }),
    })

    return {
      data: response.data.map(mapOrderListItem),
      meta: response.meta,
    }
  }

  async function getOrder(id: string): Promise<UserOrderDetail> {
    const response = await apiRequest<OrderDetailApiItem>(`/orders/${id}`, {
      method: 'GET',
    })

    return mapOrderDetail(response)
  }

  async function cancelOrder(id: string): Promise<void> {
    await apiRequest<void>(`/orders/${id}/cancel`, { method: 'PATCH' })
  }

  async function createOrder(
    payload: CreateOrderRequest,
  ): Promise<UserOrderDetail & { checkoutUrl: string }> {
    const response = await apiRequest<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: payload,
    })

    return {
      ...mapOrderDetail(response),
      checkoutUrl: response.checkoutUrl,
    }
  }

  return {
    listMyOrders,
    getOrder,
    cancelOrder,
    createOrder,
  }
}
