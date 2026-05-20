import type { BackofficeVenuePayload, BackofficeVenueRecord } from '~~/shared/types'
import { readRequiredBodyObject, requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'venue')
  const body = await readRequiredBodyObject<Partial<BackofficeVenuePayload>>(event)

  return proxyBackendRequest<BackofficeVenueRecord, Partial<BackofficeVenuePayload>>(event, `/venues/${id}`, {
    method: 'PATCH',
    body,
  })
})
