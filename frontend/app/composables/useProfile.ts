import type { ChangePasswordRequest, UpdateProfileRequest, UserProfile } from '~~/shared/types'
import { buildAuthHeaders } from '~/utils/apiAuth'
import { normalizeApiError } from '~/utils/apiError'

export function useProfile() {
  const accessToken = useState<string | null>('auth-access-token', () => null)
  const user = useState<UserProfile | null>('auth-user', () => null)
  const pending = useState<boolean>('profile-pending', () => false)

  const apiRequest = useApiRequest()
  const { getApiErrorMessage, getApiErrorStatus, isApiSessionExpiredError } = useApiErrorMessage()

  async function fetchProfile(): Promise<UserProfile> {
    pending.value = true

    try {
      const profile = await apiRequest<UserProfile>('/users/me', {
        method: 'GET',
        headers: buildAuthHeaders(accessToken.value, true),
      })

      user.value = profile

      return profile
    }
    catch (error) {
      normalizeApiError(error, 'No pudimos cargar tu perfil.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
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
        headers: buildAuthHeaders(accessToken.value, true),
      })

      user.value = profile

      return profile
    }
    catch (error) {
      normalizeApiError(error, 'No pudimos actualizar tu perfil.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
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
        headers: buildAuthHeaders(accessToken.value, true),
      })
    }
    catch (error) {
      normalizeApiError(error, 'No pudimos actualizar tu contraseña.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
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
