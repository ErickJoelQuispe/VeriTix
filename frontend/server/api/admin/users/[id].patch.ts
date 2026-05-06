import type { BackofficeUpdateUserPayload, BackofficeUserRecord } from '~/types'
import { readRequiredBodyObject, requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'user')
  const body = await readRequiredBodyObject<BackofficeUpdateUserPayload>(event)

  return proxyBackendRequest<BackofficeUserRecord, BackofficeUpdateUserPayload>(event, `/users/${id}`, {
    method: 'PATCH',
    body,
  })
})
