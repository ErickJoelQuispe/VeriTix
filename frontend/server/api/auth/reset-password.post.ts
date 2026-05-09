import type { MessageResponse, ResetPasswordRequest } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody<ResetPasswordRequest>(event)

  return proxyBackendRequest<MessageResponse, ResetPasswordRequest>(event, '/auth/reset-password', {
    method: 'POST',
    body,
  })
})
