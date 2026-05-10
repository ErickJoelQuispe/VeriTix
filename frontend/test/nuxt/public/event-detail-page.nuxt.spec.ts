import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import EventDetailPage from '@/pages/events/[id].vue'

const {
  state,
  useApiErrorMessageMock,
  usePublicEventArtistsMock,
  usePublicEventMock,
  useRouteMock,
} = vi.hoisted(() => {
  const state = {
    route: { params: { id: 'evt-1' } },
    event: {
      id: 'evt-1',
      name: 'Neon Skyline Live',
      description: 'Una noche de synths, luces y euforia.',
      dateISO: '2026-05-24T20:30:00.000Z',
      doorsOpenISO: '2026-05-24T19:00:00.000Z',
      startSaleISO: '2026-03-01T10:00:00.000Z',
      endSaleISO: '2026-05-24T18:00:00.000Z',
      maxCapacity: 18000,
      imageUrl: 'https://cdn.example/neon-skyline.jpg',
      currency: 'EUR',
      creatorId: 'user-1',
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
        imageUrl: null,
      },
      format: {
        id: 'format-1',
        name: 'Presencial',
        slug: 'presencial',
        description: null,
        icon: null,
      },
      genres: [
        { id: 'genre-1', name: 'Electrónica', slug: 'electronica' },
      ],
    },
    lineup: [
      {
        id: 'lineup-1',
        role: 'HEADLINER',
        performanceOrder: 1,
        performanceTime: '2026-05-24T20:30:00.000Z',
        eventId: 'evt-1',
        artist: {
          id: 'artist-1',
          name: 'The Midnight',
          slug: 'the-midnight',
          imageUrl: null,
          country: 'US',
        },
      },
    ],
  }

  const useRouteMock = vi.fn(() => state.route)
  const usePublicEventMock = vi.fn(() => ({
    data: ref(state.event),
    status: ref('success'),
    error: ref(null),
  }))
  const usePublicEventArtistsMock = vi.fn(() => ({
    data: ref(state.lineup),
    status: ref('success'),
    error: ref(null),
  }))
  const useApiErrorMessageMock = vi.fn(() => ({
    getApiErrorMessage: vi.fn((message: unknown, fallback: string) => (typeof message === 'string' ? message : fallback)),
    getApiErrorStatus: vi.fn(() => 500),
  }))

  return {
    state,
    useApiErrorMessageMock,
    usePublicEventArtistsMock,
    usePublicEventMock,
    useRouteMock,
  }
})

mockNuxtImport('useRoute', () => useRouteMock)
mockNuxtImport('usePublicEvent', () => usePublicEventMock)
mockNuxtImport('usePublicEventArtists', () => usePublicEventArtistsMock)
mockNuxtImport('useApiErrorMessage', () => useApiErrorMessageMock)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('event detail page', () => {
  it('renders a two-column detail layout with lineup items', async () => {
    const wrapper = await mountSuspended(EventDetailPage)

    expect(wrapper.text()).toContain('Neon Skyline Live')
    expect(wrapper.text()).toContain('Lineup')
    expect(wrapper.text()).toContain('The Midnight')
    expect(wrapper.text()).toContain('Ver venue')
    expect(wrapper.html()).toContain('lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]')
    expect(wrapper.html()).toContain('overflow-hidden rounded-3xl border border-default/55')
  })
})
