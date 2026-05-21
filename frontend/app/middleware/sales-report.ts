export default defineNuxtRouteMiddleware(() => {
  const { requireSalesReportAccess } = useRouteAccess()

  const redirectTo = requireSalesReportAccess()

  if (redirectTo) {
    return navigateTo(redirectTo)
  }
})
