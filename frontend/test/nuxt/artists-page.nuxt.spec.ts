import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import ArtistsPage from '@/pages/artists/index.vue'

const {
  navigateToMock,
  state,
  useApiErrorMessageMock,
  useEventCatalogFiltersMock,
  usePublicArtistsMock,
} = vi.hoisted(() => {
  const state = {
    artistsResponse: {
      data: [
        {
          id: 'artist-1',
          name: 'The Cure',
          bio: 'Banda británica de rock alternativo.',
          imageUrl: null,
          country: 'GB',
          website: 'https://www.thecure.com',
          isActive: true,
          genres: [{ id: 'genre-1', name: 'Rock', slug: 'rock' }],
        },
      ],
      meta: { total: 18, page: 1, limit: 24, totalPages: 2 },
    },
    genres: [] as Array<{ id: string, name: string }>,
  }

  const navigateToMock = vi.fn((to: string) => to)

  const usePublicArtistsMock = vi.fn(() => ({
    data: ref(state.artistsResponse),
    status: ref('success'),
    error: ref(null),
  }))

  const useEventCatalogFiltersMock = vi.fn(() => ({
    genres: { data: ref(state.genres) },
    cities: ref([]),
  }))

  const useApiErrorMessageMock = vi.fn(() => ({
    getApiErrorMessage: vi.fn((message: unknown, fallback: string) =>
      typeof message === 'string' ? message : fallback,
    ),
  }))

  return {
    navigateToMock,
    state,
    useApiErrorMessageMock,
    useEventCatalogFiltersMock,
    usePublicArtistsMock,
  }
})

mockNuxtImport('usePublicArtists', () => usePublicArtistsMock)
mockNuxtImport('useEventCatalogFilters', () => useEventCatalogFiltersMock)
mockNuxtImport('useApiErrorMessage', () => useApiErrorMessageMock)
mockNuxtImport('navigateTo', () => navigateToMock)

beforeEach(() => {
  vi.clearAllMocks()
  state.artistsResponse = {
    data: [
      {
        id: 'artist-1',
        name: 'The Cure',
        bio: 'Banda británica de rock alternativo.',
        imageUrl: null,
        country: 'GB',
        website: 'https://www.thecure.com',
        isActive: true,
        genres: [{ id: 'genre-1', name: 'Rock', slug: 'rock' }],
      },
    ],
    meta: { total: 18, page: 1, limit: 24, totalPages: 2 },
  }
  state.genres = []

  usePublicArtistsMock.mockImplementation(() => ({
    data: ref(state.artistsResponse),
    status: ref('success'),
    error: ref(null),
  }))

  useEventCatalogFiltersMock.mockImplementation(() => ({
    genres: { data: ref(state.genres) },
    cities: ref([]),
  }))
})

describe('artists page', () => {
  it('renders the new filter panel', async () => {
    const wrapper = await mountSuspended(ArtistsPage)

    expect(wrapper.text()).toContain('Nombre del artista')
    expect(wrapper.text()).toContain('País')
    expect(wrapper.text()).toContain('Género')
    expect(wrapper.text()).toContain('Estado')
    expect(wrapper.text()).toContain('Limpiar filtros')
  })

  it('shows pagination above and below results', async () => {
    const wrapper = await mountSuspended(ArtistsPage)

    expect(wrapper.findAll('nav[aria-label="Pagination"]').length).toBe(2)
  })

  it('hides pagination when the empty state is shown', async () => {
    state.artistsResponse = { data: [], meta: { total: 0, page: 1, limit: 24, totalPages: 0 } }

    const wrapper = await mountSuspended(ArtistsPage)

    expect(wrapper.text()).toContain('No hay artistas para estos filtros.')
    expect(wrapper.find('nav[aria-label="Pagination"]').exists()).toBe(false)
  })

  it('uses the loading spinner on search', async () => {
    usePublicArtistsMock.mockImplementation(() => ({
      data: ref({ data: [], meta: { total: 0, page: 1, limit: 24, totalPages: 0 } }),
      status: ref('pending'),
      error: ref(null),
    }))

    const wrapper = await mountSuspended(ArtistsPage)
    const searchButton = wrapper.get('button[type="submit"]')

    expect(searchButton.find('span.animate-spin').exists()).toBe(true)
    expect(searchButton.find('svg').exists()).toBe(false)
  })
})
