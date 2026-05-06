export default defineNuxtPlugin(() => {
  const { ensureSession } = useAuth()

  onNuxtReady(() => {
    void ensureSession()
  })
})
