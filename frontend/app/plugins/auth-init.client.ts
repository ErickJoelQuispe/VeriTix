export default defineNuxtPlugin(() => {
  const { ensureSession, refreshStatus, sessionStatus } = useAuth()

  onNuxtReady(() => {
    if (sessionStatus.value !== 'unknown' || refreshStatus.value === 'refreshing') {
      return
    }

    void ensureSession().catch(() => {
      if (sessionStatus.value === 'unknown') {
        sessionStatus.value = 'guest'
      }
    })
  })
})
