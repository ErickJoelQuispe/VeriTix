import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import BaseSpinner from '@/components/base/Spinner.vue'
import MyFavoritesPage from '@/pages/users/me/favorites/index.vue'

const favoriteItem = {
  id: 'favorite-1',
  event: {
    id: 'event-1',
    name: 'Rock Fest',
    eventDate: '2026-08-15T20:00:00Z',
    imageUrl: null,
    venue: { id: 'venue-1', name: 'Movistar Arena', city: 'Buenos Aires' },
    format: { id: 'format-1', name: 'Concert' },
  },
  createdAt: '2026-05-01T10:00:00Z',
}

const fetchMyFavoritesMock = vi.fn().mockResolvedValue(undefined)

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

const { useFavoriteMock } = vi.hoisted(() => {
  const useFavoriteMock = vi.fn((eventId: string, initialIsFavorited = false) => {
    const isFavorited = ref(initialIsFavorited)

    return {
      isFavorited,
      toggle: vi.fn(async () => {
        isFavorited.value = false
      }),
    }
  })

  return { useFavoriteMock }
})

mockNuxtImport('useMyFavorites', () => () => ({
  favorites: ref([favoriteItem]),
  total: ref(1),
  isLoading: ref(false),
  error: ref<string | null>(null),
  fetchMyFavorites: fetchMyFavoritesMock,
}))

mockNuxtImport('useFavorite', () => useFavoriteMock)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('myFavoritesPage — /users/me/favorites', () => {
  it('shows a single loading spinner while the list loads', async () => {
    const deferred = createDeferred<void>()
    fetchMyFavoritesMock.mockReturnValueOnce(deferred.promise)

    const wrapper = await mountSuspended(MyFavoritesPage)

    expect(wrapper.findAllComponents(BaseSpinner)).toHaveLength(1)

    deferred.resolve()
    await flushPromises()
  })

  it('renders the favorites page and removes a favorite when toggled', async () => {
    const wrapper = await mountSuspended(MyFavoritesPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Mis eventos favoritos')
    expect(wrapper.text()).toContain('Mis eventos')
    expect(wrapper.text()).toContain('Rock Fest')

    const toggleButton = wrapper.findAll('button').find(button => button.text().includes('Quitar'))
    expect(toggleButton).toBeDefined()

    await toggleButton!.trigger('click')
    await flushPromises()

    expect(useFavoriteMock).toHaveBeenCalledWith('event-1', true)
    expect(wrapper.text()).not.toContain('Rock Fest')
  })
})
