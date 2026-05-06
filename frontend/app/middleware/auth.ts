export default defineNuxtRouteMiddleware(async () => {
  const { requireAuthenticated } = useRouteAccess()

  return requireAuthenticated('/login')
})
