import type { AdminEventDetail } from '~/types'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'event')

  return proxyBackendRequest<AdminEventDetail>(event, `/events/${id}`, {
    method: 'GET',
  })
})
