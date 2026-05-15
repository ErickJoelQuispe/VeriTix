export function useRouteAccess() {
  const { isAuthenticated, user } = useAuth()

  const isBackofficeUser = computed(() => user.value?.role === 'ADMIN')

  function requireAuthenticated(redirectTo = '/login'): string | undefined {
    if (!isAuthenticated.value) {
      return redirectTo
    }
  }

  function requireBackofficeAccess(): string | undefined {
    if (!isAuthenticated.value) {
      return '/login'
    }

    if (!isBackofficeUser.value) {
      return '/users/me'
    }
  }

  function redirectIfAuthenticated(redirectTo = '/users/me'): string | undefined {
    if (isAuthenticated.value) {
      return redirectTo
    }
  }

  return {
    requireAuthenticated,
    requireBackofficeAccess,
    redirectIfAuthenticated,
  }
}
