export type TicketStatusApi = 'ACTIVE' | 'USED' | 'CANCELLED' | 'REFUNDED'

export interface TicketListApiItem {
  id: string
  hash: string
  status: TicketStatusApi
  purchaseDate: string
  ticketType: { name: string; price: number }
  event: { id: string; name: string; eventDate: string }
  orderItem: { id: string }
}

export interface TicketDetailApiItem extends TicketListApiItem {
  qrPayload: string
  validatedAt: string | null
  createdAt: string
  order: { id: string; totalAmount: number }
  validatedBy: { name: string; lastName: string } | null
}
