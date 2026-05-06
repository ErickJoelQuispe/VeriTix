import type { AdminEventDetail, AdminEventPayload } from '~/types'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<AdminEventPayload>(event)

  return proxyBackendRequest<AdminEventDetail, AdminEventPayload>(event, '/events', {
    method: 'POST',
    body,
  })
})
