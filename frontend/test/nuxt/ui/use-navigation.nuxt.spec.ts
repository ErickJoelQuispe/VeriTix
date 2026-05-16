import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, ref } from 'vue'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { useAuthMock } = vi.hoisted(() => {
  return {
    useAuthMock: vi.fn(() => ({
      isAuthenticated: computed(() => false),
      sessionStatus: ref<'unknown' | 'authenticated' | 'guest'>('unknown'),
    })),
  }
})

mockNuxtImport('useAuth', () => useAuthMock)

// ── Harness ───────────────────────────────────────────────────────────────────

const Harness = defineComponent({
  setup() {
    return useNavigation()
  },
  template: '<div />',
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useNavigation — navItems', () => {
  it('does NOT include "Mis Eventos" when user is not authenticated (session known)', async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: computed(() => false),
      sessionStatus: ref<'unknown' | 'authenticated' | 'guest'>('guest'),
    })

    const wrapper = await mountSuspended(Harness)

    const labels = wrapper.vm.navItems.map((item: { label: string }) => item.label)
    expect(labels).not.toContain('Mis Eventos')
  })

  it('includes "Mis Eventos" at position 2 when user is authenticated', async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: computed(() => true),
      sessionStatus: ref<'unknown' | 'authenticated' | 'guest'>('authenticated'),
    })

    const wrapper = await mountSuspended(Harness)

    const labels = wrapper.vm.navItems.map((item: { label: string }) => item.label)
    expect(labels).toContain('Mis Eventos')
    expect(labels.indexOf('Mis Eventos')).toBe(2)
  })

  it('does NOT include "Mis Eventos" when session status is unknown (SSR-safe)', async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: computed(() => false),
      sessionStatus: ref<'unknown' | 'authenticated' | 'guest'>('unknown'),
    })

    const wrapper = await mountSuspended(Harness)

    const labels = wrapper.vm.navItems.map((item: { label: string }) => item.label)
    expect(labels).not.toContain('Mis Eventos')
  })

  it('"Mis Eventos" item points to /users/me/events', async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: computed(() => true),
      sessionStatus: ref<'unknown' | 'authenticated' | 'guest'>('authenticated'),
    })

    const wrapper = await mountSuspended(Harness)

    const myEventsItem = wrapper.vm.navItems.find(
      (item: { label: string, to: string }) => item.label === 'Mis Eventos',
    )
    expect(myEventsItem).toBeDefined()
    expect(myEventsItem?.to).toBe('/users/me/events')
  })
})
