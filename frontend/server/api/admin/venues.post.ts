import type { BackofficeVenuePayload, BackofficeVenueRecord } from '~~/shared/types'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<BackofficeVenuePayload>(event)

  return proxyBackendRequest<BackofficeVenueRecord, BackofficeVenuePayload>(event, '/venues', {
    method: 'POST',
    body,
  })
})
