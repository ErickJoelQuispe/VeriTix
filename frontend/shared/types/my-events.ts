// ── Ticket Status ─────────────────────────────────────────────────────────────

export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED' | 'REFUNDED'

// ── Enriched Event (used inside MyEventItem) ──────────────────────────────────

export interface EnrichedEvent {
  id: string
  name: string
  eventDate: string
  imageUrl: string | null
  venue: { id: string; name: string; city: string }
  format: { id: string; name: string } | null
}

// ── My Events ─────────────────────────────────────────────────────────────────

export interface MyEventItem {
  event: EnrichedEvent
  ticketCount: number
  dominantStatus: TicketStatus
}

export interface MyEventsResponse {
  data: MyEventItem[]
  total: number
  page: number
  limit: number
}

// ── Favorites ─────────────────────────────────────────────────────────────────

export interface FavoriteStatus {
  isFavorite: boolean
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface ReviewAuthor {
  name: string
  lastName: string
}

export interface Review {
  id: string
  userId: string
  eventId: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
  user: ReviewAuthor
}

export interface ReviewPayload {
  eventId: string
  rating: number
  comment: string
}

export interface ReviewsResponse {
  data: Review[]
  total: number
  page: number
  limit: number
}

// ── Ticket Transfers ──────────────────────────────────────────────────────────

export type TransferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED'

export interface TicketTransfer {
  id: string
  ticketId: string
  status: TransferStatus
  recipientEmail: string
  expiresAt: string
  createdAt: string
}

export interface CreateTransferPayload {
  ticketId: string
  recipientEmail: string
}

export interface TransferResult {
  accepted: true
  ticketId: string
}

export interface TransferRequiresRegistration {
  requiresRegistration: true
  transferToken: string
  recipientEmail: string
}
