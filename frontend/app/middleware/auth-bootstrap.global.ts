export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuth?.()

  if (!auth) {
    return
  }

  const { ensureSession, refreshSession, refreshStatus, sessionStatus } = auth
  const initialStatus = sessionStatus.value
  const shouldRefresh = initialStatus === 'unknown' && refreshStatus.value !== 'refreshing'

  if (!shouldRefresh) {
    return
  }

  const ok = await ensureSession()

  // ensureSession only uses the access token (in-memory).
  // After a full-page navigation (e.g. Stripe redirect) the access token is
  // gone — fall back to refresh so the httpOnly cookie restores the session.
  if (!ok && initialStatus === 'unknown') {
    await refreshSession()
  }
})
