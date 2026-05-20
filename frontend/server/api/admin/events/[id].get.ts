import type { BackofficeEventDetail } from '~~/shared/types'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'event')

  return proxyBackendRequest<BackofficeEventDetail>(event, `/events/${id}/admin-detail`, {
    method: 'GET',
  })
})
