export default defineNuxtRouteMiddleware(async () => {
  const { ensureSession, refreshStatus, sessionStatus } = useAuth()

  if (sessionStatus.value !== 'unknown' || refreshStatus.value === 'refreshing') {
    return
  }

  try {
    await ensureSession()
  }
  catch {
    if (sessionStatus.value === 'unknown') {
      sessionStatus.value = 'guest'
    }
  }
})
