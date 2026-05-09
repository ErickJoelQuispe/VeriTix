export default defineNuxtRouteMiddleware(async () => {
  const { requireAuthenticated } = useRouteAccess()

  const redirectTo = await requireAuthenticated('/login')

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
