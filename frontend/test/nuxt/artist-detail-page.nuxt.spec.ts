import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import ArtistDetailPage from '@/pages/artists/[id].vue'

const {
  state,
  useApiErrorMessageMock,
  usePublicArtistMock,
  usePublicEventsMock,
  useRouteMock,
} = vi.hoisted(() => {
  const state = {
    route: { params: { id: 'artist-1' } },
    artist: {
      id: 'artist-1',
      name: 'The Cure',
      slug: 'the-cure',
      bio: 'Banda británica de rock alternativo.',
      imageUrl: null,
      country: 'GB',
      website: 'https://www.thecure.com',
      isActive: true,
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T14:45:00.000Z',
      genres: [
        { id: 'genre-1', name: 'Rock', slug: 'rock' },
      ],
    },
    upcoming: {
      data: [
        {
          id: 'evt-upcoming-1',
          name: 'The Cure en Madrid',
          dateISO: '2026-07-12T20:00:00.000Z',
          imageUrl: null,
          currency: 'EUR',
          venue: { id: 'venue-1', name: 'Luna Arena', city: 'Madrid' },
          format: null,
        },
      ],
      meta: { total: 1, page: 1, limit: 24, totalPages: 1, hasNext: false, hasPrev: false },
    },
    past: {
      data: [
        {
          id: 'evt-past-1',
          name: 'The Cure en Barcelona',
          dateISO: '2025-09-18T20:00:00.000Z',
          imageUrl: null,
          currency: 'EUR',
          venue: { id: 'venue-2', name: 'Palau Sant Jordi', city: 'Barcelona' },
          format: null,
        },
      ],
      meta: { total: 1, page: 1, limit: 24, totalPages: 1, hasNext: false, hasPrev: false },
    },
  }

  const useRouteMock = vi.fn(() => state.route)
  const usePublicArtistMock = vi.fn(() => ({
    data: ref(state.artist),
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
    usePublicArtistMock,
    usePublicEventsMock,
    useRouteMock,
  }
})

mockNuxtImport('useRoute', () => useRouteMock)
mockNuxtImport('usePublicArtist', () => usePublicArtistMock)
mockNuxtImport('usePublicEvents', () => usePublicEventsMock)
mockNuxtImport('useApiErrorMessage', () => useApiErrorMessageMock)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('artist detail page', () => {
  it('shows profile metadata and event sections', async () => {
    const wrapper = await mountSuspended(ArtistDetailPage)

    expect(wrapper.text()).toContain('The Cure')
    expect(wrapper.text()).toContain('Próximos y actuales eventos')
    expect(wrapper.text()).toContain('Eventos pasados')
    expect(wrapper.text()).toContain('The Cure en Madrid')
    expect(wrapper.text()).toContain('The Cure en Barcelona')
    expect(wrapper.text()).toContain('Abrir sitio')
  })
})
