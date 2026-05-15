import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

const profileResponse = {
  id: 'user-1',
  email: 'ana@example.com',
  name: 'Ana',
  lastName: 'Pérez',
  role: 'BUYER',
  avatarUrl: null,
}

const { apiRequestMock, useApiRequestMock } = vi.hoisted(() => {
  const apiRequestMock = vi.fn()
  return { apiRequestMock, useApiRequestMock: vi.fn(() => apiRequestMock) }
})

mockNuxtImport('useApiRequest', () => useApiRequestMock)

const Harness = defineComponent({
  setup() {
    const auth = useAuth()
    const profile = useProfile()
    return { ...auth, ...profile }
  },
  template: '<div />',
})

beforeEach(async () => {
  vi.clearAllMocks()
  apiRequestMock.mockReset()
  apiRequestMock.mockImplementation(async (path: string) => {
    if (path === '/auth/login') {
      return { accessToken: 'token-abc', user: profileResponse }
    }
    if (path === '/users/me') {
      return profileResponse
    }
    if (path === '/users/me/password') {
      return undefined
    }
    throw new Error(`Unexpected path: ${path}`)
  })
})

describe('useProfile', () => {
  it('fetchProfile obtiene el perfil y actualiza el estado user', async () => {
    const wrapper = await mountSuspended(Harness)

    await wrapper.vm.login({ email: 'a@a.com', password: 'Password1' })

    const result = await wrapper.vm.fetchProfile()

    expect(apiRequestMock).toHaveBeenCalledWith('/users/me', {
      method: 'GET',
    })
    expect(result).toEqual(profileResponse)
    expect(wrapper.vm.user).toEqual(profileResponse)
  })

  it('fetchProfile setea pending correctamente', async () => {
    const wrapper = await mountSuspended(Harness)

    await wrapper.vm.login({ email: 'a@a.com', password: 'Password1' })

    vi.clearAllMocks()
    apiRequestMock.mockResolvedValueOnce(profileResponse)

    const promise = wrapper.vm.fetchProfile()

    expect(wrapper.vm.pending).toBe(true)
    await promise
    expect(wrapper.vm.pending).toBe(false)
  })

  it('updateProfile envía PATCH y actualiza el estado', async () => {
    const wrapper = await mountSuspended(Harness)

    await wrapper.vm.login({ email: 'a@a.com', password: 'Password1' })

    vi.clearAllMocks()
    apiRequestMock.mockResolvedValueOnce(profileResponse)

    const result = await wrapper.vm.updateProfile({ name: 'Ana María' } as any)

    expect(apiRequestMock).toHaveBeenCalledWith('/users/me', {
      method: 'PATCH',
      body: { name: 'Ana María' },
    })
    expect(result).toEqual(profileResponse)
  })

  it('changePassword envía PATCH al endpoint de contraseña', async () => {
    const wrapper = await mountSuspended(Harness)

    await wrapper.vm.login({ email: 'a@a.com', password: 'Password1' })

    vi.clearAllMocks()
    apiRequestMock.mockResolvedValueOnce(undefined)

    await wrapper.vm.changePassword({
      currentPassword: 'old123',
      newPassword: 'NewPassword1',
    } as any)

    expect(apiRequestMock).toHaveBeenCalledWith('/users/me/password', {
      method: 'PATCH',
      body: { currentPassword: 'old123', newPassword: 'NewPassword1' },
    })
  })
})
