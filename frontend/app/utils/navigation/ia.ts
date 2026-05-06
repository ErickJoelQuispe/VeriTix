export interface AppNavItem {
  label: string
  to: string
}

export interface BackofficeNavItem extends AppNavItem {
  icon: string
}

export const MAIN_NAV_ITEMS: AppNavItem[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Eventos', to: '/events' },
]

export const BACKOFFICE_NAV_ITEMS: BackofficeNavItem[] = [
  { label: 'Backoffice', to: '/backoffice', icon: 'i-lucide-grid-2x2' },
  { label: 'Dashboard', to: '/backoffice/dashboard', icon: 'i-lucide-layout-dashboard' },
  { label: 'Eventos', to: '/backoffice/events', icon: 'i-lucide-calendar-range' },
  { label: 'Usuarios', to: '/backoffice/users', icon: 'i-lucide-users' },
  { label: 'Artistas', to: '/backoffice/artists', icon: 'i-lucide-mic-2' },
  { label: 'Venues', to: '/backoffice/venues', icon: 'i-lucide-building-2' },
]
