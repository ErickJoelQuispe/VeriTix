import type { RegisterRequest, RegisterResponse } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterRequest>(event)

  return proxyBackendRequest<RegisterResponse, RegisterRequest>(event, '/auth/register', {
    method: 'POST',
    body,
  })
})
