export default defineNuxtRouteMiddleware(async () => {
  const { requireBackofficeAccess } = useRouteAccess()

  const redirectTo = await requireBackofficeAccess()

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
