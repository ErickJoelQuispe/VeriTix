import type { AdminUpdateUserPayload, AdminUserRecord } from '~/types'
import { readRequiredBodyObject, requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'user')
  const body = await readRequiredBodyObject<AdminUpdateUserPayload>(event)

  return proxyBackendRequest<AdminUserRecord, AdminUpdateUserPayload>(event, `/users/${id}`, {
    method: 'PATCH',
    body,
  })
})
