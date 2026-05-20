import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const EVENT_DETAIL_FIXTURE = {
  id: 'event-1',
  name: 'Rock Fest',
  description: 'The biggest rock fest of the year',
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
  venue: { id: 'venue-1', name: 'Movistar Arena', city: 'Buenos Aires', slug: 'movistar-arena', address: '123 Main St', state: null, country: 'Argentina', capacity: 2000, type: 'ARENA' as const, website: null, imageUrl: null },
  format: null,
  genres: [],
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { getEventMock, useBackofficeEventsRepositoryMock } = vi.hoisted(() => {
  const getEventMock = vi.fn()
  return {
    getEventMock,
    useBackofficeEventsRepositoryMock: vi.fn(() => ({ getEvent: getEventMock })),
  }
})

vi.mock('@/repositories/backofficeEventsRepository', () => ({
  useBackofficeEventsRepository: useBackofficeEventsRepositoryMock,
}))

// ── Harness ───────────────────────────────────────────────────────────────────

function makeHarness(eventId: string) {
  return defineComponent({
    setup() {
      return useEventDetail(ref(eventId))
    },
    template: '<div />',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useEventDetail — fetch', () => {
  it('populates event with full detail on success', async () => {
    getEventMock.mockResolvedValueOnce(EVENT_DETAIL_FIXTURE)

    const wrapper = await mountSuspended(makeHarness('event-1'))

    expect(wrapper.vm.event?.id).toBe('event-1')
    expect(wrapper.vm.event?.name).toBe('Rock Fest')
    expect(wrapper.vm.event?.imageUrl).toBe('https://example.com/rock-fest.jpg')
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('calls getEvent with the correct eventId', async () => {
    getEventMock.mockResolvedValueOnce(EVENT_DETAIL_FIXTURE)

    await mountSuspended(makeHarness('event-1'))

    expect(getEventMock).toHaveBeenCalledWith('event-1')
  })
})

describe('useEventDetail — graceful error fallback', () => {
  it('leaves event null and does not expose error when getEvent fails', async () => {
    getEventMock.mockRejectedValueOnce(new Error('Not found'))

    const wrapper = await mountSuspended(makeHarness('event-1'))

    expect(wrapper.vm.event).toBeNull()
    expect(wrapper.vm.isLoading).toBe(false)
    // No error exposed — silent failure per spec
  })

  it('exposes isLoading false after fetch error', async () => {
    getEventMock.mockRejectedValueOnce(new Error('Unauthorized'))

    const wrapper = await mountSuspended(makeHarness('event-1'))

    expect(wrapper.vm.isLoading).toBe(false)
  })
})
