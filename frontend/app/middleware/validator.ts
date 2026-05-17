export default defineNuxtRouteMiddleware(() => {
  const { requireValidatorAccess } = useRouteAccess()

  const redirectTo = requireValidatorAccess()

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
