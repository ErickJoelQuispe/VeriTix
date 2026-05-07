import type { ChangePasswordRequest, UpdateProfileRequest, UserProfile } from '~~/shared/types'

function buildAuthHeaders(accessToken: string | null): HeadersInit {
  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing access token',
    })
  }

  return {
    authorization: `Bearer ${accessToken}`,
  }
}

export function useProfile() {
  const accessToken = useState<string | null>('auth-access-token', () => null)
  const user = useState<UserProfile | null>('auth-user', () => null)
  const pending = useState<boolean>('profile-pending', () => false)

  const apiRequest = useApiRequest()
  const { getApiErrorMessage, getApiErrorStatus, isApiSessionExpiredError } = useApiErrorMessage()

  function normalizeProfileError(error: unknown, fallback: string): never {
    const normalizedError = createError({
      statusCode: getApiErrorStatus(error) ?? 500,
      statusMessage: getApiErrorMessage(error, fallback),
      data: error,
    })

    if (isApiSessionExpiredError(error)) {
      ;(normalizedError as Record<string, unknown>).__sessionExpired = true
    }

    throw normalizedError
  }

  async function fetchProfile(): Promise<UserProfile> {
    pending.value = true

    try {
      const profile = await apiRequest<UserProfile>('/users/me', {
        method: 'GET',
        headers: buildAuthHeaders(accessToken.value),
      })

      user.value = profile

      return profile
    }
    catch (error) {
      normalizeProfileError(error, 'No pudimos cargar tu perfil.')
    }
    finally {
      pending.value = false
    }
  }

  async function updateProfile(payload: UpdateProfileRequest): Promise<UserProfile> {
    pending.value = true

    try {
      const profile = await apiRequest<UserProfile, UpdateProfileRequest>('/users/me', {
        method: 'PATCH',
        body: payload,
        headers: buildAuthHeaders(accessToken.value),
      })

      user.value = profile

      return profile
    }
    catch (error) {
      normalizeProfileError(error, 'No pudimos actualizar tu perfil.')
    }
    finally {
      pending.value = false
    }
  }

  async function changePassword(payload: ChangePasswordRequest): Promise<void> {
    pending.value = true

    try {
      await apiRequest<void, ChangePasswordRequest>('/users/me/password', {
        method: 'PATCH',
        body: payload,
        headers: buildAuthHeaders(accessToken.value),
      })
    }
    catch (error) {
      normalizeProfileError(error, 'No pudimos actualizar tu contraseña.')
    }
    finally {
      pending.value = false
    }
  }

  return {
    user,
    pending,
    fetchProfile,
    updateProfile,
    changePassword,
  }
}
