import type { BackofficeCreateUserPayload, BackofficeUserRecord } from '~~/shared/types/backoffice'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<BackofficeCreateUserPayload>(event)

  return proxyBackendRequest<BackofficeUserRecord, BackofficeCreateUserPayload>(event, '/users', {
    method: 'POST',
    body,
  })
})
