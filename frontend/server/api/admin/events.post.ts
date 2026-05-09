import type { BackofficeEventDetail, BackofficeEventPayload } from '~~/shared/types'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<BackofficeEventPayload>(event)

  return proxyBackendRequest<BackofficeEventDetail, BackofficeEventPayload>(event, '/events', {
    method: 'POST',
    body,
  })
})
