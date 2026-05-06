export default defineNuxtRouteMiddleware(async () => {
  const { requireAdmin } = useRouteAccess()

  return requireAdmin()
})
