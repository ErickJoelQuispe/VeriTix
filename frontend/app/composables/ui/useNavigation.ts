import { computed } from 'vue'
import { MAIN_NAV_ITEMS, MY_EVENTS_NAV_ITEM } from '~/utils/navigation/ia'
import { useAuth } from '~/composables/auth/useAuth'

export function useNavigation() {
  const { isAuthenticated, sessionStatus } = useAuth()

  const navItems = computed(() => {
    // SSR-safe: do not add the item until the session is known
    if (sessionStatus.value === 'unknown') return MAIN_NAV_ITEMS
    if (!isAuthenticated.value) return MAIN_NAV_ITEMS
    // Insert "Mis Eventos" after "Eventos" (index 1 → splice at 2)
    const items = [...MAIN_NAV_ITEMS]
    items.splice(2, 0, MY_EVENTS_NAV_ITEM)
    return items
  })

  return { navItems }
}
