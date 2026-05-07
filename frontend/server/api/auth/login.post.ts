import type { AuthResponse, LoginRequest } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginRequest>(event)

  return proxyBackendRequest<AuthResponse, LoginRequest>(event, '/auth/login', {
    method: 'POST',
    body,
  })
})
