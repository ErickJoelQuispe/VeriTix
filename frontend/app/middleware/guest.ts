export default defineNuxtRouteMiddleware(() => {
  const { redirectIfAuthenticated } = useRouteAccess()

  const redirectTo = redirectIfAuthenticated()

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
