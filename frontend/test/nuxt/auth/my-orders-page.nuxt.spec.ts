import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import BaseSpinner from '@/components/base/Spinner.vue'
import MyOrdersPage from '@/pages/users/me/orders/index.vue'

const fetchMyOrdersMock = vi.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } })

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

mockNuxtImport('useAppNotifications', () => () => ({
  notifyApiError: vi.fn(),
}))

mockNuxtImport('useMyOrders', () => () => ({
  orders: ref([]),
  total: ref(0),
  isLoading: ref(false),
  error: ref<string | null>(null),
  fetchMyOrders: fetchMyOrdersMock,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('myOrdersPage — /users/me/orders', () => {
  it('shows a single loading spinner while the list loads', async () => {
    const deferred = createDeferred<{ data: unknown[]; meta: unknown }>()
    fetchMyOrdersMock.mockReturnValueOnce(deferred.promise)

    const wrapper = await mountSuspended(MyOrdersPage)

    const loadingSection = wrapper.find('.min-h-72')
    expect(loadingSection.exists()).toBe(true)
    expect(loadingSection.findAllComponents(BaseSpinner)).toHaveLength(1)

    deferred.resolve({ data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } })
    await flushPromises()
  })
})
