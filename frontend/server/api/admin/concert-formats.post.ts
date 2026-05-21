import type { BackofficeConcertFormatPayload, BackofficeFormatRecord } from '~~/shared/types'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<BackofficeConcertFormatPayload>(event)

  return proxyBackendRequest<BackofficeFormatRecord, BackofficeConcertFormatPayload>(event, '/concert-formats', {
    method: 'POST',
    body,
  })
})
