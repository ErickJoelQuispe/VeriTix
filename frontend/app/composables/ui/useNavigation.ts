import { computed } from 'vue'
import { MAIN_NAV_ITEMS } from '~/utils/navigation/ia'

export function useNavigation() {
  const navItems = computed(() => {
    return MAIN_NAV_ITEMS
  })

  return { navItems }
}
