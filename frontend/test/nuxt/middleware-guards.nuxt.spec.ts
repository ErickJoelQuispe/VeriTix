import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import adminMiddleware from '~/middleware/admin'
import authMiddleware from '~/middleware/auth'
import guestMiddleware from '~/middleware/guest'

const { navigateToMock, useAuthMock } = vi.hoisted(() => {
  return {
    navigateToMock: vi.fn((to: string) => to),
    useAuthMock: vi.fn(),
  }
})

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useAuth', () => useAuthMock)

describe('middleware guards', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('auth middleware', () => {
    it('redirecciona a login cuando no hay sesión', async () => {
      const ensureSession = vi.fn().mockResolvedValue(true)

      useAuthMock.mockReturnValue({
        ensureSession,
        isAuthenticated: ref(false),
      })

      const result = await authMiddleware({} as never, {} as never)

      expect(ensureSession).toHaveBeenCalledTimes(1)
      expect(navigateToMock).toHaveBeenCalledWith('/login')
      expect(result).toBe('/login')
    })

    it('permite continuar cuando la sesión está activa', async () => {
      useAuthMock.mockReturnValue({
        ensureSession: vi.fn().mockResolvedValue(true),
        isAuthenticated: ref(true),
      })

      const result = await authMiddleware({} as never, {} as never)

      expect(navigateToMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe('guest middleware', () => {
    it('envía al perfil cuando el usuario ya está autenticado', async () => {
      useAuthMock.mockReturnValue({
        ensureSession: vi.fn().mockResolvedValue(true),
        isAuthenticated: ref(true),
      })

      const result = await guestMiddleware({} as never, {} as never)

      expect(navigateToMock).toHaveBeenCalledWith('/users/me')
      expect(result).toBe('/users/me')
    })

    it('deja pasar a invitados', async () => {
      useAuthMock.mockReturnValue({
        ensureSession: vi.fn().mockResolvedValue(true),
        isAuthenticated: ref(false),
      })

      const result = await guestMiddleware({} as never, {} as never)

      expect(navigateToMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe('admin middleware', () => {
    it('envía a login si no hay sesión', async () => {
      useAuthMock.mockReturnValue({
        ensureSession: vi.fn().mockResolvedValue(true),
        isAuthenticated: ref(false),
        user: ref(null),
      })

      const result = await adminMiddleware({} as never, {} as never)

      expect(navigateToMock).toHaveBeenCalledWith('/login')
      expect(result).toBe('/login')
    })

    it('envía a /users/me si el rol no es ADMIN', async () => {
      useAuthMock.mockReturnValue({
        ensureSession: vi.fn().mockResolvedValue(true),
        isAuthenticated: ref(true),
        user: ref({ role: 'CREATOR' }),
      })

      const result = await adminMiddleware({} as never, {} as never)

      expect(navigateToMock).toHaveBeenCalledWith('/users/me')
      expect(result).toBe('/users/me')
    })

    it('permite acceso al usuario ADMIN', async () => {
      useAuthMock.mockReturnValue({
        ensureSession: vi.fn().mockResolvedValue(true),
        isAuthenticated: ref(true),
        user: ref({ role: 'ADMIN' }),
      })

      const result = await adminMiddleware({} as never, {} as never)

      expect(navigateToMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
