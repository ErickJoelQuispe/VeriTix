import type { AdminEventDetail, AdminEventPayload } from '~/types'
import { readRequiredBodyObject, requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'event')
  const body = await readRequiredBodyObject<Partial<AdminEventPayload>>(event)

  return proxyBackendRequest<AdminEventDetail, Partial<AdminEventPayload>>(event, `/events/${id}`, {
    method: 'PATCH',
    body,
  })
})
