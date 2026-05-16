import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { apiRequestMock, useApiRequestMock } = vi.hoisted(() => {
  const apiRequestMock = vi.fn()
  return { apiRequestMock, useApiRequestMock: vi.fn(() => apiRequestMock) }
})

mockNuxtImport('useApiRequest', () => useApiRequestMock)

// ── Harness factory ───────────────────────────────────────────────────────────

function makeHarness(eventId: string) {
  return defineComponent({
    setup() {
      return useFavorite(eventId)
    },
    template: '<div />',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useFavorite — checkFavorite', () => {
  it('sets isFavorited to true when API returns isFavorite: true', async () => {
    apiRequestMock.mockResolvedValueOnce({ isFavorite: true })

    const wrapper = await mountSuspended(makeHarness('event-1'))
    await wrapper.vm.checkFavorite()

    expect(wrapper.vm.isFavorited).toBe(true)
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('sets isFavorited to false when API returns isFavorite: false', async () => {
    apiRequestMock.mockResolvedValueOnce({ isFavorite: false })

    const wrapper = await mountSuspended(makeHarness('event-2'))
    await wrapper.vm.checkFavorite()

    expect(wrapper.vm.isFavorited).toBe(false)
  })
})

describe('useFavorite — toggle', () => {
  it('toggles from false to true when API returns isFavorite: true', async () => {
    apiRequestMock.mockResolvedValueOnce({ isFavorite: true })

    const wrapper = await mountSuspended(makeHarness('event-1'))
    expect(wrapper.vm.isFavorited).toBe(false)

    await wrapper.vm.toggle()

    expect(wrapper.vm.isFavorited).toBe(true)
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('toggles from true to false when API returns isFavorite: false', async () => {
    // Prime the state to true first
    apiRequestMock.mockResolvedValueOnce({ isFavorite: true })
    const wrapper = await mountSuspended(makeHarness('event-1'))
    await wrapper.vm.checkFavorite()
    expect(wrapper.vm.isFavorited).toBe(true)

    // Now toggle off
    apiRequestMock.mockResolvedValueOnce({ isFavorite: false })
    await wrapper.vm.toggle()

    expect(wrapper.vm.isFavorited).toBe(false)
  })

  it('reverts to previous state when API throws', async () => {
    const wrapper = await mountSuspended(makeHarness('event-1'))
    // Initial state: false
    expect(wrapper.vm.isFavorited).toBe(false)

    apiRequestMock.mockRejectedValueOnce(new Error('Network failure'))

    // Should revert back to false after error
    await wrapper.vm.toggle()

    expect(wrapper.vm.isFavorited).toBe(false)
    expect(wrapper.vm.isLoading).toBe(false)
  })
})
