import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  UserProfile,
} from '~~/shared/types'

export function useAuth() {
  const accessToken = useState<string | null>('auth-access-token', () => null)
  const user = useState<UserProfile | null>('auth-user', () => null)
  const pending = useState<boolean>('auth-pending', () => false)
  const sessionStatus = useState<'unknown' | 'authenticated' | 'anonymous'>('auth-session-status', () => 'unknown')
  const refreshStatus = useState<'idle' | 'refreshing'>('auth-refresh-status', () => 'idle')
  const refreshPromise = useState<Promise<AuthResponse | null> | null>('auth-refresh-promise', () => null)

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
    sessionStatus.value = 'anonymous'
  }

  async function ensureSession(): Promise<boolean> {
    if (isAuthenticated.value) {
      sessionStatus.value = 'authenticated'
      return true
    }

    if (sessionStatus.value === 'anonymous') {
      return false
    }

    if (import.meta.server) {
      return false
    }

    const response = await refreshSession()
    return Boolean(response)
  }

  async function register(payload: RegisterRequest): Promise<AuthResponse> {
    pending.value = true

    try {
      await apiRequest<RegisterResponse, RegisterRequest>('/auth/register', {
        method: 'POST',
        body: payload,
        skipAuthRefresh: true,
      })

      return await login({
        email: payload.email,
        password: payload.password,
      })
    }
    finally {
      pending.value = false
    }
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
    if (refreshPromise.value) {
      return await refreshPromise.value
    }

    refreshStatus.value = 'refreshing'
    refreshPromise.value = (async () => {
      try {
        const response = await apiRequest<AuthResponse>('/auth/refresh', {
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
      return await refreshPromise.value
    }
    finally {
      refreshPromise.value = null
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
      sessionStatus.value = 'anonymous'
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
    login,
    refreshSession,
    ensureSession,
    logout,
    clearAuth,
    forgotPassword,
    resetPassword,
  }
}
