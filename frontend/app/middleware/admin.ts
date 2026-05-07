export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const { requireAdmin } = useRouteAccess()

  return requireAdmin()
})
