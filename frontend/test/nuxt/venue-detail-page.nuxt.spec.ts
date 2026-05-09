import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import VenueDetailPage from '@/pages/venues/[id].vue'

const {
  state,
  useApiErrorMessageMock,
  usePublicEventsMock,
  usePublicVenueMock,
  useRouteMock,
} = vi.hoisted(() => {
  const state = {
    route: { params: { id: 'venue-1' } },
    venue: {
      id: 'venue-1',
      name: 'Luna Arena',
      slug: 'luna-arena',
      address: 'Av. Siempre Viva 123',
      city: 'Madrid',
      state: null,
      country: 'ES',
      capacity: 20000,
      type: 'ARENA',
      isActive: true,
      imageUrl: null,
      website: 'https://example.com/venue',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T14:45:00.000Z',
    },
    upcoming: {
      data: [
        {
          id: 'evt-upcoming-1',
          name: 'Neon Skyline Live',
          dateISO: '2026-05-24T20:30:00.000Z',
          imageUrl: null,
          currency: 'EUR',
          venue: { id: 'venue-1', name: 'Luna Arena', city: 'Madrid' },
          format: null,
        },
      ],
      meta: { total: 1, page: 1, limit: 24, totalPages: 1, hasNext: false, hasPrev: false },
    },
    past: {
      data: [],
      meta: { total: 0, page: 1, limit: 24, totalPages: 0, hasNext: false, hasPrev: false },
    },
  }

  const useRouteMock = vi.fn(() => state.route)
  const usePublicVenueMock = vi.fn(() => ({
    data: ref(state.venue),
    status: ref('success'),
    error: ref(null),
  }))
  const usePublicEventsMock = vi.fn((filters: { value?: { dateFrom?: string, dateTo?: string } }) => {
    if (filters.value?.dateFrom) {
      return {
        data: ref(state.upcoming),
        status: ref('success'),
        error: ref(null),
      }
    }

    return {
      data: ref(state.past),
      status: ref('success'),
      error: ref(null),
    }
  })
  const useApiErrorMessageMock = vi.fn(() => ({
    getApiErrorMessage: vi.fn((message: unknown, fallback: string) => (typeof message === 'string' ? message : fallback)),
    getApiErrorStatus: vi.fn(() => 500),
  }))

  return {
    state,
    useApiErrorMessageMock,
    usePublicEventsMock,
    usePublicVenueMock,
    useRouteMock,
  }
})

mockNuxtImport('useRoute', () => useRouteMock)
mockNuxtImport('usePublicVenue', () => usePublicVenueMock)
mockNuxtImport('usePublicEvents', () => usePublicEventsMock)
mockNuxtImport('useApiErrorMessage', () => useApiErrorMessageMock)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('venue detail page', () => {
  it('shows venue metadata and the backend limitation note', async () => {
    const wrapper = await mountSuspended(VenueDetailPage)

    expect(wrapper.text()).toContain('Luna Arena')
    expect(wrapper.text()).toContain('Eventos relacionados')
    expect(wrapper.text()).toContain('Artistas en este venue')
    expect(wrapper.text()).toContain('El backend público todavía no expone una vista directa de artistas por venue')
    expect(wrapper.text()).toContain('Neon Skyline Live')
    expect(wrapper.text()).toContain('Abrir sitio')
  })
})
