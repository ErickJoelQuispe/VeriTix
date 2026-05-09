import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'artist')

  return proxyBackendRequest<unknown>(event, `/artists/${id}`, {
    method: 'DELETE',
  })
})
