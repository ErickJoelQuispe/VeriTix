export default defineNuxtRouteMiddleware(() => {
  const { requireBackofficeAccess } = useRouteAccess()

  const redirectTo = requireBackofficeAccess()

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
