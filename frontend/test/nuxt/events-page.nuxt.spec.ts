import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import EventsPage from '@/pages/events/index.vue'

const {
  navigateToMock,
  state,
  useApiErrorMessageMock,
  useEventCatalogFiltersMock,
  usePublicEventsMock,
} = vi.hoisted(() => {
  const state = {
    eventsResponse: {
      data: [
        {
          id: 'evt-1',
          name: 'Neon Skyline Live',
          dateISO: '2026-05-24T20:30:00.000Z',
          imageUrl: 'https://cdn.example/neon-skyline.jpg',
          currency: 'EUR',
          venue: { id: 'ven-1', name: 'Luna Arena', city: 'Madrid' },
          format: null,
        },
      ],
      meta: { total: 48, page: 1, limit: 24, totalPages: 2 },
    },
    genres: [] as Array<{ id: string, name: string }>,
    cities: [] as string[],
  }

  const navigateToMock = vi.fn((to: string) => to)

  const usePublicEventsMock = vi.fn(() => ({
    data: ref(state.eventsResponse),
    status: ref('success'),
    error: ref(null),
  }))

  const useEventCatalogFiltersMock = vi.fn(() => ({
    genres: { data: ref(state.genres) },
    cities: ref(state.cities),
  }))

  const useApiErrorMessageMock = vi.fn(() => ({
    getApiErrorMessage: vi.fn((message: unknown, fallback: string) => (
      typeof message === 'string' ? message : fallback
    )),
  }))

  return {
    navigateToMock,
    state,
    useApiErrorMessageMock,
    useEventCatalogFiltersMock,
    usePublicEventsMock,
  }
})

mockNuxtImport('usePublicEvents', () => usePublicEventsMock)
mockNuxtImport('useEventCatalogFilters', () => useEventCatalogFiltersMock)
mockNuxtImport('useApiErrorMessage', () => useApiErrorMessageMock)
mockNuxtImport('navigateTo', () => navigateToMock)

beforeEach(() => {
  vi.clearAllMocks()
  state.eventsResponse = {
    data: [
      {
        id: 'evt-1',
        name: 'Neon Skyline Live',
        dateISO: '2026-05-24T20:30:00.000Z',
        imageUrl: 'https://cdn.example/neon-skyline.jpg',
        currency: 'EUR',
        venue: { id: 'ven-1', name: 'Luna Arena', city: 'Madrid' },
        format: null,
      },
    ],
    meta: { total: 48, page: 1, limit: 24, totalPages: 2 },
  }
  state.genres = []
  state.cities = []
})

describe('events page', () => {
  it('renders pagination above and below the results when there are events', async () => {
    const wrapper = await mountSuspended(EventsPage)

    const paginations = wrapper.findAll('nav[aria-label="Pagination"]')
    expect(paginations.length).toBe(2)
  })

  it('does not render pagination when the empty state is shown', async () => {
    state.eventsResponse = {
      data: [],
      meta: { total: 0, page: 1, limit: 24, totalPages: 0 },
    }

    const wrapper = await mountSuspended(EventsPage)

    expect(wrapper.text()).toContain('No hay eventos para estos filtros.')
    expect(wrapper.find('nav[aria-label="Pagination"]').exists()).toBe(false)
  })
})
