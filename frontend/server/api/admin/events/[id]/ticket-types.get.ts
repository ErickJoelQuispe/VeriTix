import type { TicketType } from '~~/shared/types/domain'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'event')

  return proxyBackendRequest<TicketType[]>(event, `/events/${id}/ticket-types`, {
    method: 'GET',
  })
})
