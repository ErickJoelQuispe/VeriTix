import type { VerifyEmailResponse } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)
  const normalizedToken = Array.isArray(token) ? token[0] : token

  return proxyBackendRequest<VerifyEmailResponse>(event, '/auth/verify-email', {
    method: 'GET',
    query: { token: normalizedToken ?? undefined },
  })
})
