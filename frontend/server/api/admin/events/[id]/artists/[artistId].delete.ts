import { getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  const artistEntryId = getRouterParam(event, 'artistId')

  return proxyBackendRequest(event, `/events/${eventId}/artists/${artistEntryId}`, {
    method: 'DELETE',
  })
})
