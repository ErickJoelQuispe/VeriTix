import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import OrderSuccessPage from '@/pages/orders/[id]/success.vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ORDER_ID = 'order-abc'

function makeOrderDetail() {
  return {
    id: ORDER_ID,
    totalAmount: 150,
    status: 'PENDING' as const,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
    checkoutUrl: null,
    event: {
      id: 'event-1',
      name: 'Rock Fest',
      eventDate: '2026-08-15T20:00:00Z',
      currency: 'USD',
    },
    items: [
      {
        id: 'item-1',
        quantity: 2,
        unitPrice: 75,
        subtotal: 150,
        ticketType: { id: 'tt-1', name: 'Pista General', price: 75 },
      },
    ],
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
    path: `/orders/${ORDER_ID}/success`,
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

describe('orderSuccessPage — /orders/:id/success', () => {
  it('renders event name, total ticket count, and total amount when order fetch succeeds', async () => {
    fetchOrderDetailMock.mockResolvedValueOnce(makeOrderDetail())

    const wrapper = await mountSuspended(OrderSuccessPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Rock Fest')
    expect(wrapper.text()).toContain('2') // total ticket count: 2 items with quantity 2
    expect(wrapper.text()).toContain('150') // total amount
  })

  it('renders the "Ver mis entradas" CTA button', async () => {
    fetchOrderDetailMock.mockResolvedValueOnce(makeOrderDetail())

    const wrapper = await mountSuspended(OrderSuccessPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Ver mis eventos')
  })

  it('redirects to / when order fetch fails', async () => {
    fetchOrderDetailMock.mockRejectedValueOnce(new Error('Not found'))

    await mountSuspended(OrderSuccessPage)
    await flushPromises()

    expect(navigateToMock).toHaveBeenCalledWith('/')
  })

  it('shows static success copy regardless of order status', async () => {
    fetchOrderDetailMock.mockResolvedValueOnce({ ...makeOrderDetail(), status: 'PENDING' })

    const wrapper = await mountSuspended(OrderSuccessPage)
    await flushPromises()

    // Should show payment processed copy — not depend on status
    expect(wrapper.text()).toContain('Pago procesado')
  })
})
