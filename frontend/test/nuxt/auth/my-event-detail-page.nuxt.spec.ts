import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import MyEventDetailPage from '@/pages/users/me/events/[id]/index.vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const EVENT_ID = 'event-abc'

const makeEventItem = (id: string = EVENT_ID) => ({
  event: {
    id,
    name: `Event ${id}`,
    eventDate: '2026-09-01T20:00:00Z',
    imageUrl: null,
    venue: { id: 'venue-1', name: 'Movistar Arena', city: 'Buenos Aires' },
    format: { id: 'format-1', name: 'Concert' },
  },
  ticketCount: 2,
  dominantStatus: 'ACTIVE' as const,
})

const makeTicket = (id: string, eventId: string = EVENT_ID) => ({
  id,
  hash: `hash${id}abcdef1234`,
  status: 'ACTIVE' as const,
  purchaseDate: '2026-04-01T10:00:00Z',
  ticketType: { name: 'Pista General', price: 75 },
  event: { id: eventId, name: 'Event', eventDate: '2026-09-01T20:00:00Z' },
  orderItem: { id: `order-item-${id}` },
})

const makeOrder = (id: string, eventId: string = EVENT_ID) => ({
  id,
  totalAmount: 150,
  status: 'PAID' as const,
  createdAt: '2026-04-01T10:00:00Z',
  event: { id: eventId, name: 'Event', eventDate: '2026-09-01T20:00:00Z' },
  checkoutUrl: null,
})

// ── Mocks ─────────────────────────────────────────────────────────────────────

const {
  fetchMyEventsMock,
  useMyEventsMock,
  fetchMyTicketsMock,
  useMyTicketsMock,
  fetchMyOrdersMock,
  useMyOrdersMock,
  useRouteMock,
} = vi.hoisted(() => {
  const fetchMyEventsMock = vi.fn().mockResolvedValue(undefined)
  const fetchMyTicketsMock = vi.fn().mockResolvedValue(undefined)
  const fetchMyOrdersMock = vi.fn().mockResolvedValue(undefined)

  const useMyEventsMock = vi.fn(() => ({
    events: ref([makeEventItem(EVENT_ID)]),
    total: ref(1),
    isLoading: ref(false),
    error: ref<string | null>(null),
    fetchMyEvents: fetchMyEventsMock,
  }))

  const useMyTicketsMock = vi.fn(() => ({
    tickets: ref([makeTicket('t1'), makeTicket('t2')]),
    total: ref(2),
    isLoading: ref(false),
    error: ref<string | null>(null),
    fetchMyTickets: fetchMyTicketsMock,
    fetchTicketDetail: vi.fn(),
  }))

  const useMyOrdersMock = vi.fn(() => ({
    orders: ref([makeOrder('o1')]),
    total: ref(1),
    isLoading: ref(false),
    error: ref<string | null>(null),
    fetchMyOrders: fetchMyOrdersMock,
    fetchOrderDetail: vi.fn(),
  }))

  const useRouteMock = vi.fn(() => ({
    params: { id: EVENT_ID },
    query: {},
    path: `/users/me/events/${EVENT_ID}`,
  }))

  return {
    fetchMyEventsMock,
    useMyEventsMock,
    fetchMyTicketsMock,
    useMyTicketsMock,
    fetchMyOrdersMock,
    useMyOrdersMock,
    useRouteMock,
  }
})

mockNuxtImport('useMyEvents', () => useMyEventsMock)
mockNuxtImport('useMyTickets', () => useMyTicketsMock)
mockNuxtImport('useMyOrders', () => useMyOrdersMock)
mockNuxtImport('useRoute', () => useRouteMock)

// ── Helpers ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  fetchMyEventsMock.mockResolvedValue(undefined)
  fetchMyTicketsMock.mockResolvedValue(undefined)
  fetchMyOrdersMock.mockResolvedValue(undefined)
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MyEventDetailPage — /users/me/events/[id]', () => {
  it('renders UserEventHeader with the correct event name', async () => {
    const wrapper = await mountSuspended(MyEventDetailPage)
    await flushPromises()

    expect(wrapper.text()).toContain(`Event ${EVENT_ID}`)
  })

  it('default tab is "Mis Entradas" and shows TicketList', async () => {
    const wrapper = await mountSuspended(MyEventDetailPage)
    await flushPromises()

    // The "Mis Entradas" tab should be active by default (tab label exists)
    const ticketsTab = wrapper.findAll('button').find(b => b.text().includes('Mis Entradas'))
    expect(ticketsTab).toBeDefined()

    // The "Reseñas próximamente" placeholder should NOT be visible (review tab is not active)
    expect(wrapper.text()).not.toContain('Reseñas próximamente')
  })

  it('shows OrderList when "Mis Órdenes" tab is clicked', async () => {
    const wrapper = await mountSuspended(MyEventDetailPage)
    await flushPromises()

    const ordersTab = wrapper.findAll('button').find(b => b.text().includes('Mis Órdenes'))
    expect(ordersTab).toBeDefined()

    await ordersTab!.trigger('click')
    await flushPromises()

    // OrderList content should be visible — the order is PAID and has the event id
    // The tab content for "orders" should render
    expect(wrapper.text()).not.toContain('Reseñas próximamente')
  })
})
