export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const { redirectIfAuthenticated } = useRouteAccess()

  return redirectIfAuthenticated('/users/me')
})
