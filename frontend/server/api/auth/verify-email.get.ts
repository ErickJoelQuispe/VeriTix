import type { VerifyEmailResponse } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)

  return proxyBackendRequest<VerifyEmailResponse>(event, '/auth/verify-email', {
    method: 'GET',
    query: { token },
  })
})
