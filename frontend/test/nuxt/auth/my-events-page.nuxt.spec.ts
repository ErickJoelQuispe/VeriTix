import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import MyEventsPage from '@/pages/users/me/events/index.vue'

const eventItem = {
  event: {
    id: 'event-1',
    name: 'Rock Fest',
    eventDate: '2026-08-15T20:00:00Z',
    imageUrl: null,
    venue: { id: 'venue-1', name: 'Movistar Arena', city: 'Buenos Aires' },
    format: { id: 'format-1', name: 'Concert' },
  },
  ticketCount: 2,
  dominantStatus: 'ACTIVE' as const,
}

const fetchMyEventsMock = vi.fn().mockResolvedValue(undefined)
const checkFavoriteMock = vi.fn().mockResolvedValue(undefined)

mockNuxtImport('useFavorite', () => (eventId: string, initialIsFavorited = false) => ({
  isFavorited: ref(eventId === 'event-1' ? true : initialIsFavorited),
  isLoading: ref(false),
  error: ref<string | null>(null),
  checkFavorite: checkFavoriteMock,
  toggle: vi.fn(),
}))

mockNuxtImport('useMyEvents', () => () => ({
  events: ref([eventItem]),
  total: ref(1),
  isLoading: ref(false),
  error: ref<string | null>(null),
  fetchMyEvents: fetchMyEventsMock,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('myEventsPage — /users/me/events', () => {
  it('renders the favorites navigation action', async () => {
    const wrapper = await mountSuspended(MyEventsPage)
    await flushPromises()

    const favoritesLink = wrapper.findAll('a').find(link => link.text().includes('Mis favoritos'))
    const saveButton = wrapper.findAll('button').find(button => button.text().includes('Guardado'))

    expect(favoritesLink).toBeDefined()
    expect(favoritesLink?.attributes('href')).toBe('/users/me/favorites')
    expect(checkFavoriteMock).toHaveBeenCalled()
    expect(saveButton).toBeDefined()
  })
})
