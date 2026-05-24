import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TicketTypeSelector from '@/components/checkout/TicketTypeSelector.vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeTicketType(overrides: Partial<{
  id: string
  name: string
  price: number
  totalQuantity: number
  availableQuantity: number
  maxPerUser: number
  isActive: boolean
}> = {}) {
  return {
    id: 'tt-1',
    name: 'Pista General',
    description: null,
    price: 75,
    totalQuantity: 10,
    availableQuantity: 10,
    maxPerUser: 3,
    isActive: true,
    saleStartDate: null,
    saleEndDate: null,
    ...overrides,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ticketTypeSelector', () => {
  it('renders ticket type name and price', async () => {
    const wrapper = await mountSuspended(TicketTypeSelector, {
      props: {
        ticketTypes: [makeTicketType({ name: 'Pista General', price: 75 })],
        loading: false,
        currency: 'EUR',
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Pista General')
    expect(wrapper.text()).toContain('75')
  })

  it('renders sold-out ticket type as disabled (availableQuantity = 0)', async () => {
    const wrapper = await mountSuspended(TicketTypeSelector, {
      props: {
        ticketTypes: [makeTicketType({ availableQuantity: 0 })],
        loading: false,
        currency: 'EUR',
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Agotado')
    // Quantity stepper buttons should not be present when sold out
    const decrementBtn = wrapper.find('[data-testid="decrement-tt-1"]')
    expect(decrementBtn.exists()).toBe(false)
  })

  it('renders inactive ticket type as disabled (isActive = false)', async () => {
    const wrapper = await mountSuspended(TicketTypeSelector, {
      props: {
        ticketTypes: [makeTicketType({ isActive: false })],
        loading: false,
        currency: 'EUR',
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Agotado')
  })

  it('increments quantity up to maxPerUser and emits update:selection', async () => {
    const wrapper = await mountSuspended(TicketTypeSelector, {
      props: {
        ticketTypes: [makeTicketType({ maxPerUser: 2, availableQuantity: 10 })],
        loading: false,
        currency: 'EUR',
      },
    })
    await flushPromises()

    const incrementBtn = wrapper.find('[data-testid="increment-tt-1"]')
    expect(incrementBtn.exists()).toBe(true)

    await incrementBtn.trigger('click')
    await flushPromises()

    const emissions = wrapper.emitted('update:selection')
    expect(emissions).toBeDefined()
    expect(emissions!.length).toBeGreaterThan(0)

    const lastEmit = emissions!.at(-1) as [Array<{ ticketTypeId: string, quantity: number, unitPrice: number }>]
    expect(lastEmit[0]).toHaveLength(1)
    expect(lastEmit[0][0]).toMatchObject({ ticketTypeId: 'tt-1', quantity: 1 })
  })

  it('does not exceed maxPerUser when incrementing', async () => {
    const wrapper = await mountSuspended(TicketTypeSelector, {
      props: {
        ticketTypes: [makeTicketType({ maxPerUser: 2, availableQuantity: 10 })],
        loading: false,
        currency: 'EUR',
      },
    })
    await flushPromises()

    const incrementBtn = wrapper.find('[data-testid="increment-tt-1"]')

    // Click 3 times — should cap at 2
    await incrementBtn.trigger('click')
    await incrementBtn.trigger('click')
    await incrementBtn.trigger('click')
    await flushPromises()

    const emissions = wrapper.emitted('update:selection') as Array<[Array<{ ticketTypeId: string, quantity: number }>]>
    expect(emissions.at(-1)?.[0]?.[0]?.quantity).toBe(2)
  })

  it('does not exceed availableQuantity when incrementing (clamps to min of maxPerUser/availableQuantity)', async () => {
    const wrapper = await mountSuspended(TicketTypeSelector, {
      props: {
        ticketTypes: [makeTicketType({ maxPerUser: 5, availableQuantity: 1 })],
        loading: false,
        currency: 'EUR',
      },
    })
    await flushPromises()

    const incrementBtn = wrapper.find('[data-testid="increment-tt-1"]')
    await incrementBtn.trigger('click')
    await incrementBtn.trigger('click')
    await flushPromises()

    const emissions = wrapper.emitted('update:selection') as Array<[Array<{ ticketTypeId: string, quantity: number }>]>
    expect(emissions.at(-1)?.[0]?.[0]?.quantity).toBe(1)
  })

  it('emits only non-zero items in update:selection', async () => {
    const wrapper = await mountSuspended(TicketTypeSelector, {
      props: {
        ticketTypes: [
          makeTicketType({ id: 'tt-1', name: 'Pista' }),
          makeTicketType({ id: 'tt-2', name: 'VIP', price: 200 }),
        ],
        loading: false,
        currency: 'EUR',
      },
    })
    await flushPromises()

    // Only increment tt-1
    await wrapper.find('[data-testid="increment-tt-1"]').trigger('click')
    await flushPromises()

    const emissions = wrapper.emitted('update:selection') as Array<[Array<{ ticketTypeId: string, quantity: number }>]>
    const lastEmit = emissions.at(-1)?.[0] ?? []

    // Only tt-1 should be in the array (tt-2 has quantity 0)
    expect(lastEmit).toHaveLength(1)
    expect(lastEmit[0]?.ticketTypeId).toBe('tt-1')
  })

  it('shows total computed correctly', async () => {
    const wrapper = await mountSuspended(TicketTypeSelector, {
      props: {
        ticketTypes: [makeTicketType({ price: 75, maxPerUser: 3, availableQuantity: 5 })],
        loading: false,
        currency: 'EUR',
      },
    })
    await flushPromises()

    const incrementBtn = wrapper.find('[data-testid="increment-tt-1"]')
    await incrementBtn.trigger('click')
    await incrementBtn.trigger('click')
    await flushPromises()

    // Total should be 75 * 2 = 150
    expect(wrapper.text()).toContain('150')
  })

  it('shows skeletons when loading is true', async () => {
    const wrapper = await mountSuspended(TicketTypeSelector, {
      props: {
        ticketTypes: [],
        loading: true,
        currency: 'EUR',
      },
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="ticket-type-skeleton"]').exists()).toBe(true)
  })
})
