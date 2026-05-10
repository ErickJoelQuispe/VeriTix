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

const { apiRequestMock, useApiRequestMock } = vi.hoisted(() => {
  const apiRequestMock = vi.fn()

  return {
    apiRequestMock,
    useApiRequestMock: vi.fn(() => apiRequestMock),
  }
})

mockNuxtImport('useApiRequest', () => useApiRequestMock)

const AuthHarness = defineComponent({
  setup() {
    return useAuth()
  },
  template: '<div />',
})

beforeEach(() => {
  vi.clearAllMocks()

  apiRequestMock.mockImplementation(async (path: string) => {
    if (path === '/auth/register') {
      return { ok: true }
    }

    if (path === '/auth/login') {
      return authResponse
    }

    throw new Error(`Unexpected path: ${path}`)
  })
})

describe('useAuth', () => {
  it('encadena register -> login y aplica el estado autenticado', async () => {
    const wrapper = await mountSuspended(AuthHarness)

    await wrapper.vm.register({
      email: 'ana@example.com',
      password: 'Password1',
      name: 'Ana',
      lastName: 'Pérez',
      phone: '+34958123456',
    })

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, '/auth/register', {
      method: 'POST',
      body: {
        email: 'ana@example.com',
        password: 'Password1',
        name: 'Ana',
        lastName: 'Pérez',
        phone: '+34958123456',
      },
      skipAuthRefresh: true,
    })
    expect(apiRequestMock).toHaveBeenNthCalledWith(2, '/auth/login', {
      method: 'POST',
      body: {
        email: 'ana@example.com',
        password: 'Password1',
      },
      skipAuthRefresh: true,
    })
    expect(wrapper.vm.accessToken).toBe('token-123')
    expect(wrapper.vm.user).toEqual(authResponse.user)
    expect(wrapper.vm.isAuthenticated).toBe(true)
    expect(wrapper.vm.sessionStatus).toBe('authenticated')
  })

  it('aplica el estado autenticado cuando login resuelve', async () => {
    const wrapper = await mountSuspended(AuthHarness)

    await wrapper.vm.login({
      email: 'ANA@EXAMPLE.COM',
      password: 'Password1',
    })

    expect(apiRequestMock).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: {
        email: 'ANA@EXAMPLE.COM',
        password: 'Password1',
      },
      skipAuthRefresh: true,
    })
    expect(wrapper.vm.accessToken).toBe('token-123')
    expect(wrapper.vm.user).toEqual(authResponse.user)
    expect(wrapper.vm.isAuthenticated).toBe(true)
    expect(wrapper.vm.sessionStatus).toBe('authenticated')
  })
})
