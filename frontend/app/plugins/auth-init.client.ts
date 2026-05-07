export default defineNuxtPlugin(() => {
  const { ensureSession } = useAuth()

  void ensureSession()
})
