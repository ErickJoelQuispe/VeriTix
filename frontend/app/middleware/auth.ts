export default defineNuxtRouteMiddleware(() => {
  const { requireAuthenticated } = useRouteAccess()

  const redirectTo = requireAuthenticated('/login')

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
