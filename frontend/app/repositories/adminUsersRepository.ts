import type {
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
  AdminUserRecord,
  PaginatedResponse,
} from '~/types'

export function useAdminUsersRepository() {
  const apiRequest = useApiRequest()
  const { requireAdminHeaders } = useAdminApi()

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
  }): Promise<PaginatedResponse<AdminUserRecord>> {
    return apiRequest<PaginatedResponse<AdminUserRecord>>('/admin/users', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: {
        page: pageValue,
        limit: pageSize,
        search: search.trim() || undefined,
        role: role || undefined,
        isActive: isActive || undefined,
      },
    })
  }

  async function getUser(userId: string): Promise<AdminUserRecord> {
    return apiRequest<AdminUserRecord>(`/admin/users/${userId}`, {
      method: 'GET',
      headers: requireAdminHeaders(),
    })
  }

  async function createUser(payload: AdminCreateUserPayload): Promise<AdminUserRecord> {
    return apiRequest<AdminUserRecord, AdminCreateUserPayload>('/admin/users', {
      method: 'POST',
      headers: requireAdminHeaders(),
      body: payload,
    })
  }

  async function updateUser(userId: string, payload: AdminUpdateUserPayload): Promise<AdminUserRecord> {
    return apiRequest<AdminUserRecord, AdminUpdateUserPayload>(`/admin/users/${userId}`, {
      method: 'PATCH',
      headers: requireAdminHeaders(),
      body: payload,
    })
  }

  async function deleteUser(userId: string): Promise<void> {
    await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: requireAdminHeaders(),
    })
  }

  async function findUserByEmail(email: string): Promise<AdminUserRecord | null> {
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
