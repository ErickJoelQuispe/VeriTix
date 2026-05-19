import type { BackofficeVenueRecord } from '~~/shared/types'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'venue')

  return proxyBackendRequest<BackofficeVenueRecord>(event, `/venues/${id}`, {
    method: 'GET',
  })
})
