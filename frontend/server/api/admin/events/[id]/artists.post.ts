import { getRouterParam } from 'h3'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  const body = await readRequiredBodyObject<Record<string, unknown>>(event)

  return proxyBackendRequest(event, `/events/${eventId}/artists`, {
    method: 'POST',
    body,
  })
})
