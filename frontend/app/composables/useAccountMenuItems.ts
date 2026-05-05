import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export interface AccountMenuItem {
  label: string
  description: string
  to: string
  icon: string
}

export function useAccountMenuItems(
  isAdmin: MaybeRefOrGetter<boolean>,
  adminDescription = 'Eventos, usuarios y artistas',
) {
  return computed<AccountMenuItem[]>(() => {
    const items: AccountMenuItem[] = []

    if (toValue(isAdmin)) {
      items.push({
        label: 'Panel admin',
        description: adminDescription,
        to: '/admin',
        icon: 'i-lucide-shield-check',
      })
    }

    items.push({
      label: 'Ajustes',
      description: 'Perfil, contacto y seguridad',
      to: '/users/me',
      icon: 'i-lucide-settings-2',
    })

    items.push({
      label: 'Cerrar sesión',
      description: 'Salir de VeriTix de forma segura',
      to: '/users/me/logout',
      icon: 'i-lucide-log-out',
    })

    return items
  })
}
