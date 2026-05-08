import type { UserRole } from '~~/shared/types'
import { buildAuthHeaders } from '@/utils/apiAuth'

export function useBackofficeApi() {
  const { accessToken } = useAuth()

  function requireBackofficeHeaders(): HeadersInit {
    return buildAuthHeaders(accessToken.value, true)
  }

  const roleOptions: Array<{ value: UserRole, label: string }> = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'CREATOR', label: 'Creador' },
    { value: 'VALIDATOR', label: 'Validador' },
    { value: 'BUYER', label: 'Comprador' },
  ]

  return {
    roleOptions,
    requireBackofficeHeaders,
  }
}
