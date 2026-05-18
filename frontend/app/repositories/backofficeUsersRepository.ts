import type { PaginatedResponse } from '~~/shared/api/types'
import type {
  BackofficeCreateUserPayload,
  BackofficeUpdateUserPayload,
  BackofficeUserRecord,
} from '~~/shared/types'
import { compactQuery, trimToUndefined } from '~~/shared/query'

export function useBackofficeUsersRepository() {
  const apiRequest = useApiRequest()

  async function listUsers({
    pageValue,
    pageSize,
    search,
    role,
    isActive,
  }: {
    pageValue: number
    pageSize: number
    search: string
    role: string
    isActive: string
  }): Promise<PaginatedResponse<BackofficeUserRecord>> {
    return apiRequest<PaginatedResponse<BackofficeUserRecord>>('/admin/users', {
      method: 'GET',
      query: compactQuery({
        page: pageValue,
        limit: pageSize,
        search,
        role,
        isActive,
      }),
    })
  }

  async function getUser(userId: string): Promise<BackofficeUserRecord> {
    return apiRequest<BackofficeUserRecord>(`/admin/users/${userId}`, {
      method: 'GET',
    })
  }

  async function createUser(
    payload: BackofficeCreateUserPayload,
  ): Promise<BackofficeUserRecord> {
    return apiRequest<BackofficeUserRecord, BackofficeCreateUserPayload>(
      '/admin/users',
      {
        method: 'POST',
        body: payload,
      },
    )
  }

  async function updateUser(
    userId: string,
    payload: BackofficeUpdateUserPayload,
  ): Promise<BackofficeUserRecord> {
    return apiRequest<BackofficeUserRecord, BackofficeUpdateUserPayload>(
      `/admin/users/${userId}`,
      {
        method: 'PATCH',
        body: payload,
      },
    )
  }

  async function deleteUser(userId: string): Promise<void> {
    await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    })
  }

  async function findUserByEmail(
    email: string,
  ): Promise<BackofficeUserRecord | null> {
    const normalizedEmail = trimToUndefined(email.toLowerCase())

    if (!normalizedEmail) {
      return null
    }

    return apiRequest<BackofficeUserRecord | null>('/admin/users/by-email', {
      method: 'GET',
      query: { email: normalizedEmail },
    })
  }

  async function isEmailTaken(
    email: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    const existingUser = await findUserByEmail(email)

    if (!existingUser) {
      return false
    }

    if (!excludeUserId) {
      return true
    }

    return existingUser.id !== excludeUserId
  }

  return {
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    isEmailTaken,
  }
}
