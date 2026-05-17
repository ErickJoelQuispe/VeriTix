export default defineNuxtRouteMiddleware(() => {
  const { requireAuthenticated } = useRouteAccess()

  const redirectTo = requireAuthenticated()

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
