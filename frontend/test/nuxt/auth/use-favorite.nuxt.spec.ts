import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

const { getFavoriteStatusMock, toggleFavoriteMock, useFavoritesRepositoryMock } = vi.hoisted(() => {
  const getFavoriteStatusMock = vi.fn()
  const toggleFavoriteMock = vi.fn()

  return {
    getFavoriteStatusMock,
    toggleFavoriteMock,
    useFavoritesRepositoryMock: vi.fn(() => ({
      getFavoriteStatus: getFavoriteStatusMock,
      toggleFavorite: toggleFavoriteMock,
    })),
  }
})

vi.mock('@/repositories/favoritesRepository', () => ({
  useFavoritesRepository: useFavoritesRepositoryMock,
}))

const Harness = defineComponent({
  setup() {
    return useFavorite('event-1')
  },
  template: '<div />',
})

beforeEach(() => {
  vi.clearAllMocks()
  getFavoriteStatusMock.mockResolvedValue({ isFavorite: false })
  toggleFavoriteMock.mockResolvedValue({ isFavorite: true })
})

describe('useFavorite', () => {
  it('checks the current favorite status', async () => {
    getFavoriteStatusMock.mockResolvedValueOnce({ isFavorite: true })

    const wrapper = await mountSuspended(Harness)

    await wrapper.vm.checkFavorite()

    expect(getFavoriteStatusMock).toHaveBeenCalledWith('event-1')
    expect(wrapper.vm.isFavorited).toBe(true)
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('updates favorite state when toggle succeeds', async () => {
    const wrapper = await mountSuspended(Harness)

    await wrapper.vm.toggle()

    expect(toggleFavoriteMock).toHaveBeenCalledWith('event-1')
    expect(wrapper.vm.isFavorited).toBe(true)
    expect(wrapper.vm.error).toBeNull()
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('reverts state, stores the message, and rethrows when toggle fails', async () => {
    const error = Object.assign(new Error('Network error'), {
      data: { message: 'No se pudo guardar' },
      response: { status: 500 },
    })

    const wrapper = await mountSuspended(Harness)
    wrapper.vm.isFavorited = false
    toggleFavoriteMock.mockRejectedValueOnce(error)

    await expect(wrapper.vm.toggle()).rejects.toThrow(error)

    expect(wrapper.vm.isFavorited).toBe(false)
    expect(wrapper.vm.error).toBe('No se pudo guardar')
    expect(wrapper.vm.isLoading).toBe(false)
  })
})
