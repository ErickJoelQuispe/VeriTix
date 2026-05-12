export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface OrderItem {
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

export interface OrderPayment {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: string
  providerPaymentId: string | null
  failureReason: string | null
  paidAt: string | null
  createdAt: string
}

export interface UserOrder {
  id: string
  totalAmount: number
  status: OrderStatus
  createdAt: string
  event: {
    id: string
    name: string
    eventDate: string
  }
  checkoutUrl: string | null
}

export interface UserOrderDetail extends UserOrder {
  updatedAt: string
  event: {
    id: string
    name: string
    eventDate: string
    currency: string
  }
  items: OrderItem[]
  payments: OrderPayment[]
}
