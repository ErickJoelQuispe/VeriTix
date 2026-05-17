import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import MyEventsPage from '@/pages/users/me/events/index.vue'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeEventItem = (id: string) => ({
  event: {
    id,
    name: `Event ${id}`,
    eventDate: '2026-09-01T20:00:00Z',
    imageUrl: null,
    venue: { id: 'venue-1', name: 'Movistar Arena', city: 'Buenos Aires' },
    format: null,
  },
  ticketCount: 2,
  dominantStatus: 'ACTIVE' as const,
})

// ── Mocks ─────────────────────────────────────────────────────────────────────

const {
  fetchMyEventsMock,
  useMyEventsMock,
  useFavoriteMock,
  navigateToMock,
} = vi.hoisted(() => {
  const fetchMyEventsMock = vi.fn().mockResolvedValue(undefined)

  const useMyEventsMock = vi.fn(() => ({
    events: ref([]),
    total: ref(0),
    isLoading: ref(false),
    error: ref<string | null>(null),
    fetchMyEvents: fetchMyEventsMock,
  }))

  const useFavoriteMock = vi.fn(() => ({
    isFavorited: ref(false),
    isLoading: ref(false),
    error: ref<string | null>(null),
    checkFavorite: vi.fn(),
    toggle: vi.fn().mockResolvedValue(undefined),
  }))

  const navigateToMock = vi.fn()

  return { fetchMyEventsMock, useMyEventsMock, useFavoriteMock, navigateToMock }
})

mockNuxtImport('useMyEvents', () => useMyEventsMock)
mockNuxtImport('useFavorite', () => useFavoriteMock)
mockNuxtImport('navigateTo', () => navigateToMock)

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockEventsState(overrides: {
  events?: ReturnType<typeof makeEventItem>[]
  isLoading?: boolean
  error?: string | null
  total?: number
}) {
  useMyEventsMock.mockReturnValue({
    events: ref(overrides.events ?? []),
    total: ref(overrides.total ?? (overrides.events?.length ?? 0)),
    isLoading: ref(overrides.isLoading ?? false),
    error: ref(overrides.error ?? null),
    fetchMyEvents: fetchMyEventsMock,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  // Default: empty events, not loading, no error
  mockEventsState({})
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MyEventsPage — /users/me/events', () => {
  it('renders skeleton while loading', async () => {
    mockEventsState({ isLoading: true })

    const wrapper = await mountSuspended(MyEventsPage)
    await flushPromises()

    expect(wrapper.findAll('[data-test="skeleton"], .rounded-2xl').length).toBeGreaterThanOrEqual(1)
    // Skeletons are present — no event cards and no empty state
    expect(wrapper.text()).not.toContain('No tenés eventos todavía')
  })

  it('shows empty state when events is empty', async () => {
    mockEventsState({ events: [] })

    const wrapper = await mountSuspended(MyEventsPage)
    await flushPromises()

    expect(wrapper.text()).toContain('No tenés eventos todavía')
    expect(wrapper.text()).toContain('Explorá la cartelera y comprá tus entradas.')
  })

  it('renders N cards when events are loaded', async () => {
    const items = [makeEventItem('e1'), makeEventItem('e2'), makeEventItem('e3')]
    mockEventsState({ events: items })

    const wrapper = await mountSuspended(MyEventsPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Event e1')
    expect(wrapper.text()).toContain('Event e2')
    expect(wrapper.text()).toContain('Event e3')
    expect(wrapper.text()).not.toContain('No tenés eventos todavía')
  })

  it('shows error state when there is an API error', async () => {
    mockEventsState({ error: 'No pudimos cargar tus eventos.' })

    const wrapper = await mountSuspended(MyEventsPage)
    await flushPromises()

    expect(wrapper.text()).toContain('No pudimos cargar tus eventos')
  })

  it('calls fetchMyEvents with upcoming=false when "Pasados" filter is clicked', async () => {
    mockEventsState({ events: [] })

    const wrapper = await mountSuspended(MyEventsPage)
    await flushPromises()

    // Find and click the "Pasados" button
    const buttons = wrapper.findAll('button')
    const pasadosBtn = buttons.find(b => b.text().includes('Pasados'))
    expect(pasadosBtn).toBeDefined()

    await pasadosBtn!.trigger('click')
    await flushPromises()

    expect(fetchMyEventsMock).toHaveBeenCalledWith(
      expect.objectContaining({ upcoming: false }),
    )
  })
})
