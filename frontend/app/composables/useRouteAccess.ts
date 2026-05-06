export function useRouteAccess() {
  const { ensureSession, isAuthenticated, user } = useAuth()

  const isBackofficeUser = computed(() => user.value?.role === 'ADMIN')

  async function ensureSessionSafe(): Promise<boolean> {
    try {
      return await ensureSession()
    }
    catch {
      return false
    }
  }

  async function requireAuthenticated(redirectTo = '/login'): Promise<string | undefined> {
    const sessionReady = await ensureSessionSafe()

    if (!sessionReady || !isAuthenticated.value) {
      if (import.meta.server) {
        return
      }

      return redirectTo
    }
  }

  async function requireBackofficeAccess(): Promise<string | undefined> {
    const sessionReady = await ensureSessionSafe()

    if (!sessionReady || !isAuthenticated.value) {
      if (import.meta.server) {
        return
      }

      return '/login'
    }

    if (!isBackofficeUser.value) {
      return '/users/me'
    }
  }

  async function redirectIfAuthenticated(redirectTo = '/users/me'): Promise<string | undefined> {
    const sessionReady = await ensureSessionSafe()

    if (sessionReady && isAuthenticated.value) {
      return redirectTo
    }
  }

  return {
    requireAuthenticated,
    requireBackofficeAccess,
    redirectIfAuthenticated,
  }
}
