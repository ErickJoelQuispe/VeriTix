import type { ChangePasswordRequest } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody<ChangePasswordRequest>(event)

  return proxyBackendRequest<void, ChangePasswordRequest>(event, '/users/me/password', {
    method: 'PATCH',
    body,
  })
})
