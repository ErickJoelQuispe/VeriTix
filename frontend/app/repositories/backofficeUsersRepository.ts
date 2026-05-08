import type {
  BackofficeCreateUserPayload,
  BackofficeUpdateUserPayload,
  BackofficeUserRecord,
} from '~~/shared/types/backoffice'
import type { PaginatedResponse } from '~~/shared/types/api'

export function useBackofficeUsersRepository() {
  const apiRequest = useApiRequest()
  const { requireBackofficeHeaders } = useBackofficeApi()

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
      headers: requireBackofficeHeaders(),
      query: {
        page: pageValue,
        limit: pageSize,
        search: search.trim() || undefined,
        role: role || undefined,
        isActive: isActive || undefined,
      },
    })
  }

  async function getUser(userId: string): Promise<BackofficeUserRecord> {
    return apiRequest<BackofficeUserRecord>(`/admin/users/${userId}`, {
      method: 'GET',
      headers: requireBackofficeHeaders(),
    })
  }

  async function createUser(payload: BackofficeCreateUserPayload): Promise<BackofficeUserRecord> {
    return apiRequest<BackofficeUserRecord, BackofficeCreateUserPayload>('/admin/users', {
      method: 'POST',
      headers: requireBackofficeHeaders(),
      body: payload,
    })
  }

  async function updateUser(userId: string, payload: BackofficeUpdateUserPayload): Promise<BackofficeUserRecord> {
    return apiRequest<BackofficeUserRecord, BackofficeUpdateUserPayload>(`/admin/users/${userId}`, {
      method: 'PATCH',
      headers: requireBackofficeHeaders(),
      body: payload,
    })
  }

  async function deleteUser(userId: string): Promise<void> {
    await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: requireBackofficeHeaders(),
    })
  }

  async function findUserByEmail(email: string): Promise<BackofficeUserRecord | null> {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      return null
    }

    const response = await listUsers({
      pageValue: 1,
      pageSize: 50,
      search: normalizedEmail,
      role: '',
      isActive: '',
    })

    const users = response?.data ?? []

    return users.find(user => user.email.trim().toLowerCase() === normalizedEmail) ?? null
  }

  async function isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
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
    findUserByEmail,
    isEmailTaken,
  }
}
