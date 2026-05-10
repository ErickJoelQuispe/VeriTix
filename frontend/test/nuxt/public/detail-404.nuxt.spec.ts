import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import ArtistDetailPage from '@/pages/artists/[id].vue'
import EventDetailPage from '@/pages/events/[id].vue'
import VenueDetailPage from '@/pages/venues/[id].vue'

function mock404() {
  return {
    data: ref(null),
    status: ref('error'),
    error: ref(Object.assign(new Error('Not found'), { response: { status: 404 } })),
  }
}

const { useRouteMock, useApiErrorMessageMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => ({ params: { id: 'not-found' } })),
  useApiErrorMessageMock: vi.fn(() => ({
    getApiErrorMessage: vi.fn((_: unknown, fallback: string) => fallback),
    getApiErrorStatus: vi.fn(() => 404),
  })),
}))

mockNuxtImport('useRoute', () => useRouteMock)
mockNuxtImport('useApiErrorMessage', () => useApiErrorMessageMock)

mockNuxtImport('usePublicEvent', () => vi.fn(mock404))
mockNuxtImport('usePublicEventArtists', () => vi.fn(() => ({
  data: ref([]), status: ref('success'), error: ref(null),
})))

mockNuxtImport('usePublicVenue', () => vi.fn(mock404))
mockNuxtImport('usePublicArtist', () => vi.fn(mock404))
mockNuxtImport('usePublicEvents', () => vi.fn(() => ({
  data: ref({ data: [], meta: { total: 0, page: 1, limit: 24, totalPages: 0, hasNext: false, hasPrev: false } }),
  status: ref('success'),
  error: ref(null),
})))

beforeEach(() => { vi.clearAllMocks() })

describe('detail pages — 404', () => {
  it('evento no encontrado muestra mensaje específico', async () => {
    const wrapper = await mountSuspended(EventDetailPage)
    expect(wrapper.text()).toContain('No encontramos este evento o ya no está disponible.')
  })

  it('venue no encontrado muestra mensaje específico', async () => {
    const wrapper = await mountSuspended(VenueDetailPage)
    expect(wrapper.text()).toContain('No encontramos este venue o ya no está disponible.')
  })

  it('artista no encontrado muestra mensaje específico', async () => {
    const wrapper = await mountSuspended(ArtistDetailPage)
    expect(wrapper.text()).toContain('No encontramos este artista o ya no está disponible.')
  })
})
