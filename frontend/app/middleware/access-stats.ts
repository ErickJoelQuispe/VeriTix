export default defineNuxtRouteMiddleware(() => {
  const { requireAccessStatsAccess } = useRouteAccess()

  const redirectTo = requireAccessStatsAccess()

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
