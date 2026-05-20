import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import SalesPage from '@/pages/backoffice/events/[id]/sales.vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const EVENT_ID = 'event-abc'

const EVENT_DETAIL_FIXTURE = {
  id: EVENT_ID,
  name: 'Rock Fest',
  description: null,
  eventDate: '2026-08-15T20:00:00Z',
  doorsOpenTime: null,
  startSale: null,
  endSale: null,
  maxCapacity: 1000,
  status: 'PUBLISHED',
  imageUrl: 'https://example.com/rock-fest.jpg',
  currency: 'ARS',
  creatorId: 'user-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  venue: {
    id: 'venue-1',
    name: 'Movistar Arena',
    slug: 'movistar-arena',
    address: '123 Main St',
    city: 'Buenos Aires',
    state: null,
    country: 'Argentina',
    capacity: 2000,
    type: 'ARENA' as const,
    isActive: true,
    imageUrl: null,
    website: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  format: null,
  genres: [],
}

const METRICS_FIXTURE = {
  eventId: EVENT_ID,
  eventName: 'Rock Fest',
  status: 'PUBLISHED',
  capacity: { total: 100, sold: 60, available: 40, occupancyRate: 0.6 },
  revenue: {
    total: 12000,
    byTicketType: [
      { name: 'Pista General', sold: 50, revenue: 10000 },
      { name: 'VIP', sold: 10, revenue: 2000 },
    ],
  },
  orders: { total: 70, completed: 60, pending: 5, cancelled: 5, refunded: 0 },
  topTicketType: { name: 'Pista General', sold: 50 },
  revenueByDate: [
    { date: '2026-05-01', revenue: 4000 },
    { date: '2026-05-02', revenue: 8000 },
    { date: '2026-05-03', revenue: 0 },
  ],
}

const ORDERS_RESPONSE = {
  data: [],
  meta: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const {
  useEventMetricsMock,
  useEventDetailMock,
  useEventOrdersMock,
  useRouteMock,
} = vi.hoisted(() => {
  const useEventMetricsMock = vi.fn(() => ({
    metrics: ref(METRICS_FIXTURE),
    isLoading: ref(false),
    error: ref<string | null>(null),
    avgTicketPrice: ref(200),
    fetch: vi.fn(),
  }))

  const useEventDetailMock = vi.fn(() => ({
    event: ref(EVENT_DETAIL_FIXTURE),
    isLoading: ref(false),
    fetch: vi.fn(),
  }))

  const useEventOrdersMock = vi.fn(() => ({
    orders: ref([]),
    meta: ref(ORDERS_RESPONSE.meta),
    isLoading: ref(false),
    error: ref<string | null>(null),
    statusFilter: ref(undefined),
    page: ref(1),
    fetch: vi.fn(),
    setPage: vi.fn(),
    setStatusFilter: vi.fn(),
  }))

  const useRouteMock = vi.fn(() => ({
    params: { id: EVENT_ID },
    query: {},
    path: `/backoffice/events/${EVENT_ID}/sales`,
  }))

  return { useEventMetricsMock, useEventDetailMock, useEventOrdersMock, useRouteMock }
})

mockNuxtImport('useEventMetrics', () => useEventMetricsMock)
mockNuxtImport('useEventDetail', () => useEventDetailMock)
mockNuxtImport('useEventOrders', () => useEventOrdersMock)
mockNuxtImport('useRoute', () => useRouteMock)

beforeEach(() => {
  vi.clearAllMocks()
  useEventMetricsMock.mockReturnValue({
    metrics: ref(METRICS_FIXTURE),
    isLoading: ref(false),
    error: ref<string | null>(null),
    avgTicketPrice: ref(200),
    fetch: vi.fn(),
  })
  useEventDetailMock.mockReturnValue({
    event: ref(EVENT_DETAIL_FIXTURE),
    isLoading: ref(false),
    fetch: vi.fn(),
  })
  useEventOrdersMock.mockReturnValue({
    orders: ref([]),
    meta: ref(ORDERS_RESPONSE.meta),
    isLoading: ref(false),
    error: ref<string | null>(null),
    statusFilter: ref(undefined),
    page: ref(1),
    fetch: vi.fn(),
    setPage: vi.fn(),
    setStatusFilter: vi.fn(),
  })
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sales page — hero with image', () => {
  it('renders event name from useEventDetail (not from orders)', async () => {
    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Rock Fest')
  })

  it('renders background image when event.imageUrl is present', async () => {
    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    const img = wrapper.find('img[src="https://example.com/rock-fest.jpg"]')
    expect(img.exists()).toBe(true)
  })

  it('does not render background image when event.imageUrl is null', async () => {
    useEventDetailMock.mockReturnValueOnce({
      event: ref({ ...EVENT_DETAIL_FIXTURE, imageUrl: null }),
      isLoading: ref(false),
      fetch: vi.fn(),
    })

    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    const img = wrapper.find('img[src="https://example.com/rock-fest.jpg"]')
    expect(img.exists()).toBe(false)
  })
})

describe('sales page — 5th KPI: Avg. Ticket', () => {
  it('renders "Ticket Promedio" KPI card with formatted value when avgTicketPrice > 0', async () => {
    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Ticket Promedio')
  })

  it('renders $0 avg ticket when orders.completed === 0', async () => {
    useEventMetricsMock.mockReturnValueOnce({
      metrics: ref({
        ...METRICS_FIXTURE,
        orders: { ...METRICS_FIXTURE.orders, completed: 0 },
      }),
      isLoading: ref(false),
      error: ref<string | null>(null),
      avgTicketPrice: ref(0),
      fetch: vi.fn(),
    })

    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Ticket Promedio')
    // $0 formatted
    expect(wrapper.text()).toMatch(/\$\s*0/)
  })
})

describe('sales page — segmented status bar', () => {
  it('renders the segmented bar section with success, warning and error segments', async () => {
    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    // 3 segments: success (completed), warning (pending), error (cancelled)
    const successSeg = wrapper.find('[data-testid="bar-segment-completed"]')
    const warningSeg = wrapper.find('[data-testid="bar-segment-pending"]')
    const errorSeg = wrapper.find('[data-testid="bar-segment-cancelled"]')

    expect(successSeg.exists()).toBe(true)
    expect(warningSeg.exists()).toBe(true)
    expect(errorSeg.exists()).toBe(true)
  })

  it('renders legend counts for completed, pending and cancelled', async () => {
    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    // Legend must show real counts from metrics
    expect(wrapper.text()).toContain('60') // completed
    expect(wrapper.text()).toContain('5') // pending and cancelled
  })
})

describe('sales page — revenue breakdown by ticket type', () => {
  it('renders one row per ticket type with name and revenue', async () => {
    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Pista General')
    expect(wrapper.text()).toContain('VIP')
  })

  it('renders proportional progress bars for each ticket type', async () => {
    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    const bars = wrapper.findAll('[data-testid="ticket-type-bar"]')
    expect(bars.length).toBe(2)
  })
})

describe('sales page — revenue chart', () => {
  it('renders chart bars for each revenueByDate entry', async () => {
    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    const bars = wrapper.findAll('[data-testid="revenue-chart-bar"]')
    expect(bars.length).toBe(3)
  })

  it('renders empty/flat chart when revenueByDate is empty', async () => {
    useEventMetricsMock.mockReturnValueOnce({
      metrics: ref({ ...METRICS_FIXTURE, revenueByDate: [] }),
      isLoading: ref(false),
      error: ref<string | null>(null),
      avgTicketPrice: ref(0),
      fetch: vi.fn(),
    })

    const wrapper = await mountSuspended(SalesPage)
    await flushPromises()

    const bars = wrapper.findAll('[data-testid="revenue-chart-bar"]')
    expect(bars.length).toBe(0)
  })
})
