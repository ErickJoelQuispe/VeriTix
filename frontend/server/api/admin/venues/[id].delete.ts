import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'venue')

  return proxyBackendRequest<unknown>(event, `/venues/${id}`, {
    method: 'DELETE',
  })
})
