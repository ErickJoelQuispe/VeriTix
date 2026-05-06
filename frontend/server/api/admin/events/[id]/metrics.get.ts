import type { BackofficeEventMetrics } from '~/types'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'event')

  return proxyBackendRequest<BackofficeEventMetrics>(event, `/events/${id}/metrics`, {
    method: 'GET',
  })
})
