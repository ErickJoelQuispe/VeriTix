export default defineNuxtPlugin(async () => {
  const { ensureSession } = useAuth()

  await callOnce(async () => {
    await ensureSession()
  })
})
