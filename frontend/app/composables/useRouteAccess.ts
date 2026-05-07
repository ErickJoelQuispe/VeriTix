export function useRouteAccess() {
  const { ensureSession, isAuthenticated, user } = useAuth()

  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  async function ensureSessionSafe(): Promise<boolean> {
    try {
      return await ensureSession()
    }
    catch {
      return false
    }
  }

  async function requireAuthenticated(redirectTo = '/login') {
    const sessionReady = await ensureSessionSafe()

    if (!sessionReady || !isAuthenticated.value) {
      return navigateTo(redirectTo)
    }
  }

  async function requireAdmin() {
    const sessionReady = await ensureSessionSafe()

    if (!sessionReady || !isAuthenticated.value) {
      return navigateTo('/login')
    }

    if (!isAdmin.value) {
      return navigateTo('/users/me')
    }
  }

  async function redirectIfAuthenticated(redirectTo = '/users/me') {
    const sessionReady = await ensureSessionSafe()

    if (sessionReady && isAuthenticated.value) {
      return navigateTo(redirectTo)
    }
  }

  return {
    requireAuthenticated,
    requireAdmin,
    redirectIfAuthenticated,
  }
}
