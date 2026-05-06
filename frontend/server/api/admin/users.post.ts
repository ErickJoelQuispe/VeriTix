import type { AdminCreateUserPayload, AdminUserRecord } from '~/types'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<AdminCreateUserPayload>(event)

  return proxyBackendRequest<AdminUserRecord, AdminCreateUserPayload>(event, '/users', {
    method: 'POST',
    body,
  })
})
