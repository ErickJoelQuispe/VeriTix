import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const METRICS_FIXTURE = {
  eventId: 'event-1',
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
  ],
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { apiRequestMock, useApiRequestMock } = vi.hoisted(() => {
  const apiRequestMock = vi.fn()
  return { apiRequestMock, useApiRequestMock: vi.fn(() => apiRequestMock) }
})

mockNuxtImport('useApiRequest', () => useApiRequestMock)

// ── Harness ───────────────────────────────────────────────────────────────────

function makeHarness(eventId: string) {
  return defineComponent({
    setup() {
      return useEventMetrics(ref(eventId))
    },
    template: '<div />',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useEventMetrics — initial state after successful fetch', () => {
  it('starts with isLoading false and error null after successful onMounted fetch', async () => {
    apiRequestMock.mockResolvedValueOnce(METRICS_FIXTURE)
    const wrapper = await mountSuspended(makeHarness('event-1'))

    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.error).toBeNull()
  })
})

describe('useEventMetrics — fetch', () => {
  it('populates metrics with full shape including revenueByDate on success', async () => {
    apiRequestMock.mockResolvedValueOnce(METRICS_FIXTURE)

    const wrapper = await mountSuspended(makeHarness('event-1'))

    expect(wrapper.vm.metrics?.eventId).toBe('event-1')
    expect(wrapper.vm.metrics?.revenue.total).toBe(12000)
    expect(wrapper.vm.metrics?.revenueByDate).toHaveLength(2)
    expect(wrapper.vm.metrics?.revenueByDate[0]).toEqual({ date: '2026-05-01', revenue: 4000 })
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.error).toBeNull()
  })

  it('sets error and keeps metrics null when API throws', async () => {
    apiRequestMock.mockRejectedValueOnce(new Error('Network error'))

    const wrapper = await mountSuspended(makeHarness('event-1'))

    expect(wrapper.vm.metrics).toBeNull()
    expect(wrapper.vm.error).toBe('Network error')
    expect(wrapper.vm.isLoading).toBe(false)
  })
})

describe('useEventMetrics — avgTicketPrice', () => {
  it('computes revenue.total / orders.completed when completed > 0', async () => {
    apiRequestMock.mockResolvedValueOnce(METRICS_FIXTURE)

    const wrapper = await mountSuspended(makeHarness('event-1'))

    // 12000 / 60 = 200
    expect(wrapper.vm.avgTicketPrice).toBe(200)
  })

  it('returns 0 when orders.completed === 0 (divide-by-zero guard)', async () => {
    apiRequestMock.mockResolvedValueOnce({
      ...METRICS_FIXTURE,
      orders: { ...METRICS_FIXTURE.orders, completed: 0 },
      revenue: { ...METRICS_FIXTURE.revenue, total: 0 },
    })

    const wrapper = await mountSuspended(makeHarness('event-1'))

    expect(wrapper.vm.avgTicketPrice).toBe(0)
  })
})
