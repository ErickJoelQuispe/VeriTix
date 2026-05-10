export default defineNuxtPlugin(() => {
  onNuxtReady(() => {
    const { ensureSession, refreshStatus, sessionStatus } = useAuth() ?? {}

    if (sessionStatus?.value !== 'unknown' || refreshStatus?.value === 'refreshing') {
      return
    }

    void ensureSession?.().catch(() => {
      if (sessionStatus?.value === 'unknown') {
        sessionStatus.value = 'guest'
      }
    })
  })
})
