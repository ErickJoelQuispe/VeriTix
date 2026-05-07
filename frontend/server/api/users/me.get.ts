import type { UserProfile } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<UserProfile>(event, '/users/me', {
    method: 'GET',
  })
})
