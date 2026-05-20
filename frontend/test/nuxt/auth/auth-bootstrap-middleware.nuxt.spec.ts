import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import authBootstrapMiddleware from '@/middleware/auth-bootstrap.global'

let authMock: {
  ensureSession: ReturnType<typeof vi.fn>
  refreshSession: ReturnType<typeof vi.fn>
  refreshStatus: ReturnType<typeof ref<'idle' | 'refreshing'>>
  sessionStatus: ReturnType<typeof ref<'unknown' | 'authenticated' | 'guest'>>
}

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(() => authMock),
}))

mockNuxtImport('useAuth', () => useAuthMock)

function createAuthMock(
  sessionStatus: 'unknown' | 'authenticated' | 'guest' = 'unknown',
  refreshStatus: 'idle' | 'refreshing' = 'idle',
) {
  authMock = {
    ensureSession: vi.fn().mockResolvedValue(false),
    refreshSession: vi.fn().mockResolvedValue(null),
    refreshStatus: ref(refreshStatus),
    sessionStatus: ref(sessionStatus),
  }

  useAuthMock.mockReturnValue(authMock)

  return authMock
}

describe('auth-bootstrap global middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createAuthMock()
  })

  it('ensures the session when auth status is unknown and refresh is idle', async () => {
    const auth = createAuthMock('unknown', 'idle')

    await authBootstrapMiddleware({} as any, {} as any)

    expect(auth.ensureSession).toHaveBeenCalledOnce()
  })

  it('does not ensure the session when auth status is already known', async () => {
    const auth = createAuthMock('authenticated', 'idle')

    await authBootstrapMiddleware({} as any, {} as any)

    expect(auth.ensureSession).not.toHaveBeenCalled()
  })

  it('does not ensure the session while a refresh is already running', async () => {
    const auth = createAuthMock('unknown', 'refreshing')

    await authBootstrapMiddleware({} as any, {} as any)

    expect(auth.ensureSession).not.toHaveBeenCalled()
  })

  it('propagates unexpected session errors instead of marking the user as guest', async () => {
    const auth = createAuthMock('unknown', 'idle')
    const error = new Error('Backend unavailable')

    auth.ensureSession.mockRejectedValueOnce(error)

    await expect(authBootstrapMiddleware({} as any, {} as any)).rejects.toThrow(error)
    expect(auth.sessionStatus.value).toBe('unknown')
  })
})
