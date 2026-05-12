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

const defaultApiMock = vi.hoisted(() => vi.fn())
const onNuxtReadyQueue = vi.hoisted(() => {
  const queue: Array<() => void> = []
  return {
    onNuxtReadyMock: vi.fn((cb: () => void) => queue.push(cb)),
    flushOnNuxtReady() { queue.splice(0).forEach(cb => cb()) },
  }
})

const { apiRequestMock, useApiRequestMock } = vi.hoisted(() => {
  return {
    apiRequestMock: defaultApiMock,
    useApiRequestMock: vi.fn(() => defaultApiMock),
  }
})

mockNuxtImport('useApiRequest', () => useApiRequestMock)
mockNuxtImport('onNuxtReady', () => onNuxtReadyQueue.onNuxtReadyMock)

const AuthHarness = defineComponent({
  setup() {
    return useAuth()
  },
  template: '<div />',
})

beforeEach(() => {
  vi.clearAllMocks()

  apiRequestMock.mockImplementation(async (path: string, _opts?: unknown) => {
    if (path === '/auth/register') { return { ok: true } }
    if (path === '/auth/login') { return authResponse }
    if (path === '/auth/refresh') { return authResponse }
    if (path === '/auth/logout') { return undefined }

    throw new Error(`Unexpected path: ${path}`)
  })
})

describe('useAuth — register + login', () => {
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

describe('useAuth — refreshSession', () => {
  it('restaura el estado autenticado tras un refresh exitoso', async () => {
    const wrapper = await mountSuspended(AuthHarness)

    const result = await wrapper.vm.refreshSession()

    expect(apiRequestMock).toHaveBeenCalledWith('/auth/refresh', {
      method: 'POST',
      skipAuthRefresh: true,
    })
    expect(result).toEqual(authResponse)
    expect(wrapper.vm.accessToken).toBe('token-123')
    expect(wrapper.vm.isAuthenticated).toBe(true)
    expect(wrapper.vm.sessionStatus).toBe('authenticated')
  })

  it('limpia el estado y retorna null cuando el backend responde 401', async () => {
    const authError = new Error('Refresh token no encontrado')
    Object.assign(authError, { response: { status: 401 } })

    apiRequestMock.mockRejectedValueOnce(authError)

    const wrapper = await mountSuspended(AuthHarness)

    const result = await wrapper.vm.refreshSession()

    expect(result).toBeNull()
    expect(wrapper.vm.accessToken).toBeNull()
    expect(wrapper.vm.isAuthenticated).toBe(false)
    expect(wrapper.vm.sessionStatus).toBe('guest')
  })
})

describe('useAuth — ensureSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna true y mantiene authenticated si ya hay sesión', async () => {
    const wrapper = await mountSuspended(AuthHarness)

    await wrapper.vm.login({ email: 'a@a.com', password: 'Password1' })
    vi.clearAllMocks()

    const result = await wrapper.vm.ensureSession()

    expect(result).toBe(true)
    expect(wrapper.vm.isAuthenticated).toBe(true)
    expect(wrapper.vm.sessionStatus).toBe('authenticated')
    expect(apiRequestMock).not.toHaveBeenCalled()
  })

  it('retorna false sin llamar al api cuando sessionStatus es guest', async () => {
    const wrapper = await mountSuspended(AuthHarness)

    wrapper.vm.clearAuth()
    vi.clearAllMocks()

    const result = await wrapper.vm.ensureSession()

    expect(result).toBe(false)
    expect(apiRequestMock).not.toHaveBeenCalled()
  })
})

describe('useAuth — logout', () => {
  it('llama al endpoint y limpia el estado autenticado', async () => {
    const wrapper = await mountSuspended(AuthHarness)

    await wrapper.vm.login({ email: 'a@a.com', password: 'Password1' })
    expect(wrapper.vm.isAuthenticated).toBe(true)

    await wrapper.vm.logout()

    expect(apiRequestMock).toHaveBeenCalledWith('/auth/logout', {
      method: 'POST',
      skipAuthRefresh: true,
    })
    expect(wrapper.vm.accessToken).toBeNull()
    expect(wrapper.vm.isAuthenticated).toBe(false)
    expect(wrapper.vm.sessionStatus).toBe('guest')
  })

  it('limpia el estado incluso si el endpoint responde 401', async () => {
    const authError = new Error('Refresh token no encontrado')
    Object.assign(authError, { response: { status: 401 } })

    apiRequestMock.mockRejectedValueOnce(authError)

    const wrapper = await mountSuspended(AuthHarness)

    await wrapper.vm.logout()

    expect(wrapper.vm.accessToken).toBeNull()
    expect(wrapper.vm.isAuthenticated).toBe(false)
    expect(wrapper.vm.sessionStatus).toBe('guest')
  })
})
