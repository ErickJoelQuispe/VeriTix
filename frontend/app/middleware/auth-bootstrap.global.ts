export default defineNuxtRouteMiddleware(async () => {
  const { ensureSession, refreshStatus, sessionStatus } = useAuth()

  if (sessionStatus.value !== 'unknown' || refreshStatus.value === 'refreshing') {
    return
  }

  await ensureSession()
})
