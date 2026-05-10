export default defineNuxtPlugin(() => {
  const { sessionStatus } = useAuth()
  const headers = useRequestHeaders(['cookie'])

  if (!headers.cookie?.includes('refresh_token=')) {
    sessionStatus.value = 'guest'
  }
})
