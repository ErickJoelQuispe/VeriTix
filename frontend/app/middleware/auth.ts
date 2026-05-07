export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const { requireAuthenticated } = useRouteAccess()

  return requireAuthenticated('/login')
})
