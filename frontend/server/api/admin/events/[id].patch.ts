import type { BackofficeEventDetail, BackofficeEventPayload } from '~~/shared/types'
import { readRequiredBodyObject, requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'event')
  const body = await readRequiredBodyObject<Partial<BackofficeEventPayload>>(event)

  return proxyBackendRequest<BackofficeEventDetail, Partial<BackofficeEventPayload>>(event, `/events/${id}`, {
    method: 'PATCH',
    body,
  })
})
