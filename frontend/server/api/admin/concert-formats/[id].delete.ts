import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { requireRouteId } from '~~/server/utils/admin/request'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'format')

  return proxyBackendRequest(event, `/concert-formats/${id}`, {
    method: 'DELETE',
  })
})
