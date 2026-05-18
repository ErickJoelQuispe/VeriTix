export default defineNuxtRouteMiddleware(async () => {
  const { ensureSession, refreshSession, refreshStatus, sessionStatus } = useAuth()

  if (sessionStatus.value !== 'unknown' || refreshStatus.value === 'refreshing') {
    return
  }

  const ok = await ensureSession()

  // ensureSession only uses the access token (in-memory).
  // After a full-page navigation (e.g. Stripe redirect) the access token is
  // gone — fall back to refresh so the httpOnly cookie restores the session.
  if (!ok && sessionStatus.value !== 'guest') {
    await refreshSession()
  }
})
