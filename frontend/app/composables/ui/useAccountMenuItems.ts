import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export interface AccountMenuItem {
  label: string
  description: string
  to: string
  icon: string
}

export function useAccountMenuItems(
  isBackofficeUser: MaybeRefOrGetter<boolean>,
  backofficeDescription = 'Eventos, usuarios y artistas',
  isValidatorUser: MaybeRefOrGetter<boolean> = false,
) {
  return computed<AccountMenuItem[]>(() => {
    const items: AccountMenuItem[] = []

    if (toValue(isBackofficeUser)) {
      items.push({
        label: 'Backoffice',
        description: backofficeDescription,
        to: '/backoffice',
        icon: 'i-lucide-shield-check',
      })
    }

    if (toValue(isValidatorUser)) {
      items.push({
        label: 'Panel Validador',
        description: 'Escanear y validar tickets en puerta',
        to: '/validator',
        icon: 'i-lucide-scan-qr-code',
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
