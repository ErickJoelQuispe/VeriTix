import type { TicketType } from '~~/shared/types/domain'
import { getRouterParam } from 'h3'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  const ticketTypeId = getRouterParam(event, 'ticketTypeId')
  const body = await readRequiredBodyObject<Record<string, unknown>>(event)

  return proxyBackendRequest<TicketType>(event, `/events/${eventId}/ticket-types/${ticketTypeId}`, {
    method: 'PATCH',
    body,
  })
})
