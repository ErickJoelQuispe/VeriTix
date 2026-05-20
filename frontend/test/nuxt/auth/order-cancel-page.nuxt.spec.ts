import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import OrderCancelPage from '@/pages/orders/[id]/cancel.vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ORDER_ID = 'order-xyz'
const EVENT_ID = 'event-abc'

function makeOrderDetail() {
  return {
    id: ORDER_ID,
    totalAmount: 75,
    status: 'CANCELLED' as const,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:01:00Z',
    checkoutUrl: null,
    event: {
      id: EVENT_ID,
      name: 'Rock Fest',
      eventDate: '2026-08-15T20:00:00Z',
      currency: 'USD',
    },
    items: [],
    payments: [],
  }
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const {
  fetchOrderDetailMock,
  useMyOrdersMock,
  useRouteMock,
  navigateToMock,
} = vi.hoisted(() => {
  const fetchOrderDetailMock = vi.fn()
  const navigateToMock = vi.fn()

  const useMyOrdersMock = vi.fn(() => ({
    orders: ref([]),
    total: ref(0),
    isLoading: ref(false),
    error: ref<string | null>(null),
    fetchMyOrders: vi.fn(),
    fetchOrderDetail: fetchOrderDetailMock,
    cancelMyOrder: vi.fn(),
    createOrder: vi.fn(),
  }))

  const useRouteMock = vi.fn(() => ({
    params: { id: ORDER_ID },
    query: {},
    path: `/orders/${ORDER_ID}/cancel`,
  }))

  return { fetchOrderDetailMock, useMyOrdersMock, useRouteMock, navigateToMock }
})

mockNuxtImport('useMyOrders', () => useMyOrdersMock)
mockNuxtImport('useRoute', () => useRouteMock)
mockNuxtImport('navigateTo', () => navigateToMock)

// ── Helpers ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('orderCancelPage — /orders/:id/cancel', () => {
  it('navigates to /events/:eventId when order is found', async () => {
    fetchOrderDetailMock.mockResolvedValueOnce(makeOrderDetail())

    await mountSuspended(OrderCancelPage)
    await flushPromises()

    expect(navigateToMock).toHaveBeenCalledWith(`/events/${EVENT_ID}`)
  })

  it('navigates to /events when order fetch fails', async () => {
    fetchOrderDetailMock.mockRejectedValueOnce(new Error('Not found'))

    await mountSuspended(OrderCancelPage)
    await flushPromises()

    expect(navigateToMock).toHaveBeenCalledWith('/events')
  })
})
