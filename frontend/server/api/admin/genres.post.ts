import type { BackofficeGenrePayload, BackofficeGenreRecord } from '~~/shared/types'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<BackofficeGenrePayload>(event)

  return proxyBackendRequest<BackofficeGenreRecord, BackofficeGenrePayload>(event, '/genres', {
    method: 'POST',
    body,
  })
})
