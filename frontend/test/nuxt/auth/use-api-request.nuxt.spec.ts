import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

const authResponse = {
  accessToken: 'token-123',
  user: {
    id: 'user-1',
    role: 'USER',
    email: 'ana@example.com',
    name: 'Ana',
    lastName: 'Pérez',
  },
}

let mockRaw: ReturnType<typeof vi.fn>

const { onNuxtReadyMock } = vi.hoisted(() => {
  const queue: Array<() => void> = []
  return {
    onNuxtReadyMock: vi.fn((cb: () => void) => queue.push(cb)),
  }
})

mockNuxtImport('onNuxtReady', () => onNuxtReadyMock)

const ApiHarness = defineComponent({
  setup() {
    const apiRequest = useApiRequest()
    return { apiRequest }
  },
  template: '<div />',
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('useApiRequest — auto-retry on 401', () => {
  it('reintenta con refresh cuando recibe 401 y el refresh funciona', async () => {
    mockRaw = vi.fn()
      // 1st call: /api/events → 401
      .mockRejectedValueOnce(
        Object.assign(new Error('Token expirado'), { response: { status: 401 } }),
      )
      // 2nd call: /api/auth/refresh → success
      .mockResolvedValueOnce({ _data: authResponse })
      // 3rd call: /api/events retry → success
      .mockResolvedValueOnce({ _data: [{ id: 'evt-1', name: 'Evento' }] })

    vi.stubGlobal('$fetch', { raw: mockRaw })

    const wrapper = await mountSuspended(ApiHarness)

    const result = await wrapper.vm.apiRequest('/events', { method: 'GET' })

    expect(result).toEqual([{ id: 'evt-1', name: 'Evento' }])
    expect(mockRaw).toHaveBeenCalledTimes(3)
  })

  it('lanza session expired cuando el refresh también falla con 401', async () => {
    mockRaw = vi.fn()
      // 1st call: /api/events → 401
      .mockRejectedValueOnce(
        Object.assign(new Error('Token expirado'), { response: { status: 401 } }),
      )
      // 2nd call: /api/auth/refresh → 401
      .mockRejectedValueOnce(
        Object.assign(new Error('Refresh token no encontrado'), { response: { status: 401 } }),
      )

    vi.stubGlobal('$fetch', { raw: mockRaw })

    const wrapper = await mountSuspended(ApiHarness)

    await expect(wrapper.vm.apiRequest('/events', { method: 'GET' })).rejects.toThrow()

    expect(mockRaw).toHaveBeenCalledTimes(2)
  })
})
