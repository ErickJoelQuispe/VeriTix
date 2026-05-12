export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED' | 'REFUNDED'

export interface UserTicketEvent {
  id: string
  name: string
  eventDate: string
}

export interface UserTicketType {
  name: string
  price: number
}

export interface UserTicket {
  id: string
  hash: string
  status: TicketStatus
  purchaseDate: string
  ticketType: UserTicketType
  event: UserTicketEvent
  orderItem: { id: string }
}

export interface UserTicketDetail extends UserTicket {
  qrPayload: string
  validatedAt: string | null
  createdAt: string
  order: { id: string; totalAmount: number }
  validatedBy: { name: string; lastName: string } | null
}
