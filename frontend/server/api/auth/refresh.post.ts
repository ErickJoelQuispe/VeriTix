import type { AuthResponse } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<AuthResponse>(event, '/auth/refresh', {
    method: 'POST',
  })
})
