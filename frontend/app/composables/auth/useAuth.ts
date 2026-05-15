import type { NuxtApp } from '#app'
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  UserProfile,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '~~/shared/types'

export function useAuth() {
  const nuxtApp = useNuxtApp() as NuxtApp & {
    _authRefreshPromise?: Promise<AuthResponse | null> | null
  }

  const accessToken = useState<string | null>('auth-access-token', () => null)
  const user = useState<UserProfile | null>('auth-user', () => null)
  const pending = useState<boolean>('auth-pending', () => false)
  const sessionStatus = useState<'unknown' | 'authenticated' | 'guest'>('auth-session-status', () => 'unknown')
  const refreshStatus = useState<'idle' | 'refreshing'>('auth-refresh-status', () => 'idle')

  const apiRequest = useApiRequest()
  const { isApiAuthError } = useApiErrorMessage()

  const isAuthenticated = computed(() => {
    return Boolean(accessToken.value && user.value)
  })

  function applyAuth(response: AuthResponse): AuthResponse {
    accessToken.value = response.accessToken
    user.value = response.user
    sessionStatus.value = 'authenticated'
    return response
  }

  function clearAuth(): void {
    accessToken.value = null
    user.value = null
    sessionStatus.value = 'guest'
  }

  async function ensureSession(): Promise<boolean> {
    if (isAuthenticated.value) {
      sessionStatus.value = 'authenticated'
      return true
    }

    if (sessionStatus.value === 'guest') {
      return false
    }

    try {
      const response = await apiRequest<AuthResponse>('/auth/session', {
        method: 'GET',
        skipAuthRefresh: true,
      })

      applyAuth(response)
      return true
    }
    catch (error) {
      if (isApiAuthError(error)) {
        clearAuth()
        return false
      }

      throw error
    }
  }

  async function register(payload: RegisterRequest): Promise<RegisterResponse> {
    pending.value = true

    try {
      return await apiRequest<RegisterResponse, RegisterRequest>('/auth/register', {
        method: 'POST',
        body: payload,
        skipAuthRefresh: true,
      })
    }
    finally {
      pending.value = false
    }
  }

  async function verifyEmail(payload: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return apiRequest<VerifyEmailResponse>('/auth/verify-email', {
      method: 'GET',
      query: { token: payload.token },
      skipAuthRefresh: true,
    })
  }

  async function login(payload: LoginRequest): Promise<AuthResponse> {
    pending.value = true

    try {
      const response = await apiRequest<AuthResponse, LoginRequest>('/auth/login', {
        method: 'POST',
        body: payload,
        skipAuthRefresh: true,
      })

      return applyAuth(response)
    }
    finally {
      pending.value = false
    }
  }

  async function refreshSession(): Promise<AuthResponse | null> {
    if (nuxtApp._authRefreshPromise) {
      return await nuxtApp._authRefreshPromise
    }

    refreshStatus.value = 'refreshing'
    nuxtApp._authRefreshPromise = (async () => {
      try {
        const response = import.meta.server
          ? await (async () => {
              const event = useRequestEvent()

              if (!event) {
                throw new Error('Missing request event for auth refresh')
              }

              const { proxyBackendRequest } = await import('~~/server/utils/backend-proxy')

              return proxyBackendRequest<AuthResponse>(event, '/auth/refresh', {
                method: 'POST',
              })
            })()
          : await apiRequest<AuthResponse>('/auth/refresh', {
              method: 'POST',
              skipAuthRefresh: true,
            })

        return applyAuth(response)
      }
      catch (error) {
        if (isApiAuthError(error)) {
          clearAuth()
          return null
        }

        throw error
      }
      finally {
        refreshStatus.value = 'idle'
      }
    })()

    try {
      return await nuxtApp._authRefreshPromise
    }
    finally {
      nuxtApp._authRefreshPromise = null
    }
  }

  async function logout(): Promise<void> {
    try {
      await apiRequest<void>('/auth/logout', {
        method: 'POST',
        skipAuthRefresh: true,
      })
    }
    catch (error) {
      if (!isApiAuthError(error)) {
        throw error
      }
    }
    finally {
      clearAuth()
      sessionStatus.value = 'guest'
    }
  }

  async function forgotPassword(email: string): Promise<MessageResponse> {
    return apiRequest<MessageResponse, ForgotPasswordRequest>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      skipAuthRefresh: true,
    })
  }

  async function resetPassword(token: string, password: string): Promise<MessageResponse> {
    return apiRequest<MessageResponse, ResetPasswordRequest>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      skipAuthRefresh: true,
    })
  }

  return {
    accessToken,
    user,
    pending,
    sessionStatus,
    refreshStatus,
    isAuthenticated,
    register,
    verifyEmail,
    login,
    refreshSession,
    ensureSession,
    logout,
    clearAuth,
    forgotPassword,
    resetPassword,
  }
}
