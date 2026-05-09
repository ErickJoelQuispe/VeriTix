import type { ForgotPasswordRequest, MessageResponse } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody<ForgotPasswordRequest>(event)

  return proxyBackendRequest<MessageResponse, ForgotPasswordRequest>(event, '/auth/forgot-password', {
    method: 'POST',
    body,
  })
})
