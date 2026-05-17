import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'

import TicketModal from '@/components/ticket/TicketModal.vue'

// Stub UModal — renders body slot inline when open=true
const UModalStub = defineComponent({
  name: 'UModal',
  props: { open: Boolean, title: String },
  emits: ['update:open'],
  setup(props, { slots }) {
    return () => props.open
      ? h('div', { 'data-testid': 'u-modal' }, [slots.body?.() ?? null])
      : null
  },
})

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeTicket(status: 'ACTIVE' | 'USED' | 'CANCELLED' | 'REFUNDED' = 'ACTIVE') {
  return {
    id: 'ticket-1',
    hash: 'abcdef1234567890',
    status,
    purchaseDate: '2026-04-01T10:00:00Z',
    ticketType: { name: 'Pista General', price: 75 },
    event: { id: 'event-1', name: 'Rock Fest', eventDate: '2026-09-01T20:00:00Z' },
    orderItem: { id: 'order-item-1' },
  }
}

function makeTicketDetail(status: 'ACTIVE' | 'USED' = 'ACTIVE') {
  return {
    ...makeTicket(status),
    qrPayload: 'qr-payload-hash',
    validatedAt: status === 'USED' ? '2026-09-01T21:35:00Z' : null,
    createdAt: '2026-04-01T10:00:00Z',
    order: { id: 'order-1', totalAmount: 150 },
    validatedBy: status === 'USED' ? { name: 'Carlos', lastName: 'Martínez' } : null,
  }
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { fetchTicketDetailMock, useMyTicketsMock } = vi.hoisted(() => {
  const fetchTicketDetailMock = vi.fn()

  const useMyTicketsMock = vi.fn(() => ({
    tickets: ref([]),
    total: ref(0),
    isLoading: ref(false),
    error: ref<string | null>(null),
    fetchMyTickets: vi.fn().mockResolvedValue(undefined),
    fetchTicketDetail: fetchTicketDetailMock,
  }))

  return { fetchTicketDetailMock, useMyTicketsMock }
})

mockNuxtImport('useMyTickets', () => useMyTicketsMock)

// QRCode mock — we don't want to generate actual QR in tests
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,fakeqr'),
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  fetchTicketDetailMock.mockResolvedValue(makeTicketDetail('ACTIVE'))
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ticketModal', () => {
  it('does not render QR when modal is closed', async () => {
    const wrapper = await mountSuspended(TicketModal, {
      props: {
        ticket: makeTicket('ACTIVE'),
        open: false,
      },
      global: { components: { UModal: UModalStub } },
    })
    await flushPromises()

    // fetchTicketDetail should not be called when modal is closed
    expect(fetchTicketDetailMock).not.toHaveBeenCalled()
  })

  it('shows Descargar PDF and Transferir buttons when ticket is ACTIVE', async () => {
    fetchTicketDetailMock.mockResolvedValue(makeTicketDetail('ACTIVE'))

    const wrapper = await mountSuspended(TicketModal, {
      props: {
        ticket: makeTicket('ACTIVE'),
        open: true,
      },
      global: { components: { UModal: UModalStub } },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Descargar PDF')
    expect(wrapper.text()).toContain('Transferir')
  })

  it('shows validatedAt info and hides Transferir when ticket is USED', async () => {
    fetchTicketDetailMock.mockResolvedValue(makeTicketDetail('USED'))

    const wrapper = await mountSuspended(TicketModal, {
      props: {
        ticket: makeTicket('USED'),
        open: true,
      },
      global: { components: { UModal: UModalStub } },
    })
    await flushPromises()

    // Should show validation info
    expect(wrapper.text()).toContain('Validado')
    // Should NOT show the Transferir button
    expect(wrapper.text()).not.toContain('Transferir')
  })

  it('calls fetchTicketDetail with the correct ticket id when modal opens', async () => {
    const ticket = makeTicket('ACTIVE')

    await mountSuspended(TicketModal, {
      props: {
        ticket,
        open: true,
      },
      global: { components: { UModal: UModalStub } },
    })
    await flushPromises()

    expect(fetchTicketDetailMock).toHaveBeenCalledWith(ticket.id)
  })
})
