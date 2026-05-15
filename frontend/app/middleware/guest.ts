export default defineNuxtRouteMiddleware(() => {
  const { redirectIfAuthenticated } = useRouteAccess()

  const redirectTo = redirectIfAuthenticated('/users/me')

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
