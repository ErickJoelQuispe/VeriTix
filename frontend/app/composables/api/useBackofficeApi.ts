import type { UserRole } from '~~/shared/types'

export function useBackofficeApi() {
  const roleOptions: Array<{ value: UserRole, label: string }> = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'CREATOR', label: 'Creador' },
    { value: 'VALIDATOR', label: 'Validador' },
    { value: 'BUYER', label: 'Comprador' },
  ]

  return {
    roleOptions,
  }
}
