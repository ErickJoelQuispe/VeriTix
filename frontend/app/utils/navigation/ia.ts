export interface AppNavItem {
  label: string
  to: string
}

export interface BackofficeNavItem extends AppNavItem {
  icon: string
}

export const MY_EVENTS_NAV_ITEM: AppNavItem = { label: 'Mis eventos', to: '/users/me/events' }
export const MY_ORDERS_NAV_ITEM: AppNavItem = { label: 'Mis ordenes', to: '/users/me/orders' }

export const MAIN_NAV_ITEMS: AppNavItem[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Eventos', to: '/events' },
  { label: 'Artistas', to: '/artists' },
  { label: 'Venues', to: '/venues' },
]

export const BACKOFFICE_NAV_ITEMS: BackofficeNavItem[] = [
  { label: 'Dashboard', to: '/backoffice', icon: 'i-lucide-layout-dashboard' },
  { label: 'Eventos', to: '/backoffice/events', icon: 'i-lucide-calendar-range' },
  { label: 'Usuarios', to: '/backoffice/users', icon: 'i-lucide-users' },
  { label: 'Artistas', to: '/backoffice/artists', icon: 'i-lucide-mic-2' },
  { label: 'Géneros', to: '/backoffice/genres', icon: 'i-lucide-music-2' },
  { label: 'Formatos', to: '/backoffice/concert-formats', icon: 'i-lucide-ticket' },
  { label: 'Venues', to: '/backoffice/venues', icon: 'i-lucide-building-2' },
]
