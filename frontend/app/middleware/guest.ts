export default defineNuxtRouteMiddleware(async () => {
  const { redirectIfAuthenticated } = useRouteAccess()

  return redirectIfAuthenticated('/users/me')
})
