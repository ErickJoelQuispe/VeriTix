import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const eventItem = {
  event: {
    id: 'event-1',
    name: 'Rock Fest',
    eventDate: '2026-08-15T20:00:00Z',
    imageUrl: 'https://example.com/img.jpg',
    venue: { id: 'venue-1', name: 'Movistar Arena', city: 'Buenos Aires' },
    format: { id: 'format-1', name: 'Concert' },
  },
  ticketCount: 2,
  dominantStatus: 'ACTIVE' as const,
}

const paginatedResponse = {
  data: [eventItem],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
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
    return useMyEvents()
  },
  template: '<div />',
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useMyEvents — fetchMyEvents', () => {
  it('returns list and updates state when API succeeds', async () => {
    apiRequestMock.mockResolvedValueOnce(paginatedResponse)

    const wrapper = await mountSuspended(Harness)
    await wrapper.vm.fetchMyEvents()

    expect(wrapper.vm.events).toHaveLength(1)
    expect(wrapper.vm.events[0]?.event.name).toBe('Rock Fest')
    expect(wrapper.vm.total).toBe(1)
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.error).toBeNull()
  })

  it('passes upcoming=true to the API', async () => {
    apiRequestMock.mockResolvedValueOnce(paginatedResponse)

    const wrapper = await mountSuspended(Harness)
    await wrapper.vm.fetchMyEvents({ upcoming: true })

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/events/mine',
      expect.objectContaining({
        method: 'GET',
        query: expect.objectContaining({ upcoming: true }),
      }),
    )
  })

  it('passes upcoming=false to the API', async () => {
    apiRequestMock.mockResolvedValueOnce(paginatedResponse)

    const wrapper = await mountSuspended(Harness)
    await wrapper.vm.fetchMyEvents({ upcoming: false })

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/events/mine',
      expect.objectContaining({
        method: 'GET',
        query: expect.objectContaining({ upcoming: false }),
      }),
    )
  })

  it('sets error state when API throws', async () => {
    const apiError = Object.assign(new Error('Network error'), {
      response: { status: 500 },
      data: { message: 'Internal server error' },
    })
    apiRequestMock.mockRejectedValueOnce(apiError)

    const wrapper = await mountSuspended(Harness)

    await expect(wrapper.vm.fetchMyEvents()).rejects.toThrow()

    expect(wrapper.vm.events).toHaveLength(0)
    expect(wrapper.vm.error).not.toBeNull()
    expect(wrapper.vm.isLoading).toBe(false)
  })
})
