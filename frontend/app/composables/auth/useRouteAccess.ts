export function useRouteAccess() {
  const { ensureSession, isAuthenticated, sessionStatus, user } = useAuth()

  const isBackofficeUser = computed(() => user.value?.role === 'ADMIN')

  async function ensureSessionSafe(): Promise<boolean | 'unknown'> {
    try {
      const sessionReady = await ensureSession()

      if (sessionReady) {
        return true
      }

      return sessionStatus.value === 'guest' ? false : 'unknown'
    }
    catch {
      return import.meta.server ? 'unknown' : false
    }
  }

  async function requireAuthenticated(redirectTo = '/login'): Promise<string | undefined> {
    const sessionReady = await ensureSessionSafe()

    if (sessionReady === 'unknown') {
      return
    }

    if (!sessionReady || !isAuthenticated.value) {
      return redirectTo
    }
  }

  async function requireBackofficeAccess(): Promise<string | undefined> {
    const sessionReady = await ensureSessionSafe()

    if (sessionReady === 'unknown') {
      return
    }

    if (!sessionReady || !isAuthenticated.value) {
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
