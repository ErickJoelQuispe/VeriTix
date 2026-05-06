export default defineNuxtRouteMiddleware(async () => {
  const { redirectIfAuthenticated } = useRouteAccess()

  const redirectTo = await redirectIfAuthenticated('/users/me')

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
