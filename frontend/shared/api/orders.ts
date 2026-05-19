export type OrderStatusApi = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatusApi = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface OrderItemApiItem {
  id: string
  quantity: number
  unitPrice: number
  subtotal: number
  ticketType: {
    id: string
    name: string
    price: number
  }
}

export interface PaymentApiItem {
  id: string
  amount: number
  currency: string
  status: PaymentStatusApi
  provider: string
  providerPaymentId: string | null
  failureReason: string | null
  paidAt: string | null
  createdAt: string
}

export interface OrderListApiItem {
  id: string
  totalAmount: number
  status: OrderStatusApi
  createdAt: string
  event: {
    id: string
    name: string
    eventDate: string
  }
  checkoutUrl: string | null
}

export interface OrderDetailApiItem extends OrderListApiItem {
  updatedAt: string
  event: {
    id: string
    name: string
    eventDate: string
    currency: string
  }
  items: OrderItemApiItem[]
  payments: PaymentApiItem[]
}

export interface CreateOrderRequest {
  eventId: string
  items: Array<{ ticketTypeId: string, quantity: number }>
}

export interface CreateOrderResponse extends OrderDetailApiItem {
  checkoutUrl: string
}
