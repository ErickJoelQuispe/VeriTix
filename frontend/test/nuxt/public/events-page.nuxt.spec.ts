import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import BaseSpinner from '@/components/base/Spinner.vue'
import EventsPage from '@/pages/events/index.vue'

mockNuxtImport('useRoute', () => () => ({
  query: {},
  path: '/events',
}))

mockNuxtImport('usePublicEvents', () => () => ({
  data: ref(undefined),
  status: ref<'pending' | 'success' | 'error'>('pending'),
  error: ref<Error | null>(null),
  refresh: vi.fn(),
}))

mockNuxtImport('useEventCatalogFilters', () => () => ({
  genres: { data: ref([]) },
  cities: ref([]),
}))

describe('eventsPage — /events', () => {
  it('shows a single loading spinner while the catalog loads', async () => {
    const wrapper = await mountSuspended(EventsPage)

    const loadingBlock = wrapper.find('.min-h-80')
    expect(loadingBlock.exists()).toBe(true)
    expect(loadingBlock.findAllComponents(BaseSpinner)).toHaveLength(1)
  })
})
