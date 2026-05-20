import { getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  const ticketTypeId = getRouterParam(event, 'ticketTypeId')

  return proxyBackendRequest(event, `/events/${eventId}/ticket-types/${ticketTypeId}`, {
    method: 'DELETE',
  })
})
