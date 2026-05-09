import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import VenuesPage from '@/pages/venues/index.vue'

const {
  navigateToMock,
  state,
  useApiErrorMessageMock,
  usePublicVenuesMock,
} = vi.hoisted(() => {
  const state = {
    venuesResponse: {
      data: [
        {
          id: 'venue-1',
          name: 'Luna Arena',
          address: 'Av. Siempre Viva 123',
          city: 'Madrid',
          state: null,
          country: 'ES',
          capacity: 12000,
          type: 'ARENA',
          imageUrl: null,
          website: 'https://example.com/venue',
          isActive: true,
        },
      ],
      meta: { total: 24, page: 1, limit: 24, totalPages: 2 },
    },
  }

  const navigateToMock = vi.fn((to: string) => to)

  const usePublicVenuesMock = vi.fn(() => ({
    data: ref(state.venuesResponse),
    status: ref('success'),
    error: ref(null),
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
    usePublicVenuesMock,
  }
})

mockNuxtImport('usePublicVenues', () => usePublicVenuesMock)
mockNuxtImport('useApiErrorMessage', () => useApiErrorMessageMock)
mockNuxtImport('navigateTo', () => navigateToMock)

beforeEach(() => {
  vi.clearAllMocks()
  state.venuesResponse = {
    data: [
      {
        id: 'venue-1',
        name: 'Luna Arena',
        address: 'Av. Siempre Viva 123',
        city: 'Madrid',
        state: null,
        country: 'ES',
        capacity: 12000,
        type: 'ARENA',
        imageUrl: null,
        website: 'https://example.com/venue',
        isActive: true,
      },
    ],
    meta: { total: 24, page: 1, limit: 24, totalPages: 2 },
  }

  usePublicVenuesMock.mockImplementation(() => ({
    data: ref(state.venuesResponse),
    status: ref('success'),
    error: ref(null),
  }))
})

describe('venues page', () => {
  it('renders the new filter panel', async () => {
    const wrapper = await mountSuspended(VenuesPage)

    expect(wrapper.text()).toContain('Nombre o dirección')
    expect(wrapper.text()).toContain('Ciudad')
    expect(wrapper.text()).toContain('Tipo')
    expect(wrapper.text()).toContain('Estado')
    expect(wrapper.text()).toContain('Limpiar filtros')
    expect(wrapper.html()).toContain('lg:grid-cols-3')
    expect(wrapper.html()).toContain('lg:col-span-3')
  })

  it('renders pagination twice when there are results', async () => {
    const wrapper = await mountSuspended(VenuesPage)

    expect(wrapper.findAll('nav[aria-label="Pagination"]').length).toBe(2)
  })

  it('hides pagination when no results are available', async () => {
    state.venuesResponse = { data: [], meta: { total: 0, page: 1, limit: 24, totalPages: 0 } }

    const wrapper = await mountSuspended(VenuesPage)

    expect(wrapper.text()).toContain('No hay venues para estos filtros.')
    expect(wrapper.find('nav[aria-label="Pagination"]').exists()).toBe(false)
  })
})
