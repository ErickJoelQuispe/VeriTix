import type { UpdateProfileRequest, UserProfile } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody<UpdateProfileRequest>(event)

  return proxyBackendRequest<UserProfile, UpdateProfileRequest>(event, '/users/me', {
    method: 'PATCH',
    body,
  })
})
