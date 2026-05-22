import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

const favoriteItem = {
  id: 'favorite-1',
  event: {
    id: 'event-1',
    name: 'Rock Fest',
    eventDate: '2026-08-15T20:00:00Z',
    imageUrl: 'https://example.com/img.jpg',
    venue: { id: 'venue-1', name: 'Movistar Arena', city: 'Buenos Aires' },
    format: { id: 'format-1', name: 'Concert' },
  },
  createdAt: '2026-05-01T10:00:00Z',
}

const paginatedResponse = {
  data: [favoriteItem],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
}

const { listFavoritesMock, useFavoritesRepositoryMock } = vi.hoisted(() => {
  const listFavoritesMock = vi.fn()
  return {
    listFavoritesMock,
    useFavoritesRepositoryMock: vi.fn(() => ({ listFavorites: listFavoritesMock })),
  }
})

vi.mock('@/repositories/favoritesRepository', () => ({
  useFavoritesRepository: useFavoritesRepositoryMock,
}))

const Harness = defineComponent({
  setup() {
    return useMyFavorites()
  },
  template: '<div />',
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useMyFavorites', () => {
  it('loads favorites and updates state', async () => {
    listFavoritesMock.mockResolvedValueOnce(paginatedResponse)

    const wrapper = await mountSuspended(Harness)
    await wrapper.vm.fetchMyFavorites()

    expect(listFavoritesMock).toHaveBeenCalledWith({})
    expect(wrapper.vm.favorites).toHaveLength(1)
    expect(wrapper.vm.total).toBe(1)
    expect(wrapper.vm.error).toBeNull()
  })

  it('passes pagination parameters to the repository', async () => {
    listFavoritesMock.mockResolvedValueOnce(paginatedResponse)

    const wrapper = await mountSuspended(Harness)
    await wrapper.vm.fetchMyFavorites({ page: 2, limit: 9 })

    expect(listFavoritesMock).toHaveBeenCalledWith({ page: 2, limit: 9 })
  })

  it('stores an error message when loading fails', async () => {
    listFavoritesMock.mockRejectedValueOnce(new Error('boom'))

    const wrapper = await mountSuspended(Harness)

    await expect(wrapper.vm.fetchMyFavorites()).rejects.toThrow()

    expect(wrapper.vm.favorites).toHaveLength(0)
    expect(wrapper.vm.error).not.toBeNull()
    expect(wrapper.vm.isLoading).toBe(false)
  })
})
