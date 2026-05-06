import type { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse, UserProfile } from '~~/shared/types'
import { buildAuthHeaders } from '~/utils/apiAuth'

export function useAuth() {
  const accessToken = useState<string | null>('auth-access-token', () => null)
  const user = useState<UserProfile | null>('auth-user', () => null)
  const pending = useState<boolean>('auth-pending', () => false)
  const hydrated = useState<boolean>('auth-hydrated', () => false)

  const apiRequest = useApiRequest()
  const { isApiAuthError } = useApiErrorMessage()

  const isAuthenticated = computed(() => {
    return Boolean(accessToken.value && user.value)
  })

  function applyAuth(response: AuthResponse): AuthResponse {
    accessToken.value = response.accessToken
    user.value = response.user
    hydrated.value = true
    return response
  }

  function clearAuth(): void {
    accessToken.value = null
    user.value = null
  }

  async function ensureSession(): Promise<boolean> {
    if (isAuthenticated.value) {
      hydrated.value = true
      return true
    }

    if (hydrated.value) {
      return false
    }

    const response = await refreshSession()
    hydrated.value = true
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
    try {
      const response = await apiRequest<AuthResponse>('/auth/refresh', {
        method: 'POST',
        headers: buildAuthHeaders(accessToken.value),
        skipAuthRefresh: true,
      })

      return applyAuth(response)
    }
    catch (error) {
      if (isApiAuthError(error)) {
        clearAuth()
      }

      return null
    }
  }

  async function logout(): Promise<void> {
    try {
      await apiRequest<void>('/auth/logout', {
        method: 'POST',
        headers: buildAuthHeaders(accessToken.value),
        skipAuthRefresh: true,
      })
    }
    finally {
      clearAuth()
      hydrated.value = true
    }
  }

  return {
    accessToken,
    user,
    pending,
    hydrated,
    isAuthenticated,
    register,
    login,
    refreshSession,
    ensureSession,
    logout,
    clearAuth,
  }
}
