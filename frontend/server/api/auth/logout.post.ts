import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<void>(event, '/auth/logout', {
    method: 'POST',
  })
})
