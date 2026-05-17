import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ORDER_DETAIL = {
  id: 'order-1',
  totalAmount: 150,
  status: 'PENDING' as const,
  createdAt: '2026-05-01T10:00:00Z',
  updatedAt: '2026-05-01T10:00:00Z',
  checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_abc',
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

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { apiRequestMock, useApiRequestMock } = vi.hoisted(() => {
  const apiRequestMock = vi.fn()
  return { apiRequestMock, useApiRequestMock: vi.fn(() => apiRequestMock) }
})

mockNuxtImport('useApiRequest', () => useApiRequestMock)

// ── Harness ───────────────────────────────────────────────────────────────────

const Harness = defineComponent({
  setup() {
    return useMyOrders()
  },
  template: '<div />',
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useMyOrders — createOrder', () => {
  it('delegates to repository and returns order detail with checkoutUrl', async () => {
    apiRequestMock.mockResolvedValueOnce(ORDER_DETAIL)

    const wrapper = await mountSuspended(Harness)
    const result = await wrapper.vm.createOrder({
      eventId: 'event-1',
      items: [{ ticketTypeId: 'tt-1', quantity: 2 }],
    })

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/orders',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_abc')
    expect(result.event.name).toBe('Rock Fest')
  })

  it('propagates session-expired error as normalized error', async () => {
    const sessionExpiredError = Object.assign(new Error('Unauthorized'), {
      response: { status: 401 },
      data: { message: 'Session expired', error: 'Unauthorized' },
    })
    apiRequestMock.mockRejectedValueOnce(sessionExpiredError)

    const wrapper = await mountSuspended(Harness)

    await expect(wrapper.vm.createOrder({
      eventId: 'event-1',
      items: [{ ticketTypeId: 'tt-1', quantity: 1 }],
    })).rejects.toThrow()
  })

  it('propagates backend error (422) without swallowing', async () => {
    const validationError = Object.assign(new Error('Unprocessable Entity'), {
      response: { status: 422 },
      data: { message: 'Insufficient stock', error: 'Unprocessable Entity' },
    })
    apiRequestMock.mockRejectedValueOnce(validationError)

    const wrapper = await mountSuspended(Harness)

    await expect(wrapper.vm.createOrder({
      eventId: 'event-1',
      items: [{ ticketTypeId: 'tt-1', quantity: 100 }],
    })).rejects.toThrow()
  })
})
