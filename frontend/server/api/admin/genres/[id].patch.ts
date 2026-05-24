import type { BackofficeGenrePayload, BackofficeGenreRecord } from '~~/shared/types'
import { readRequiredBodyObject, requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'genre')
  const body = await readRequiredBodyObject<BackofficeGenrePayload>(event)

  return proxyBackendRequest<BackofficeGenreRecord, BackofficeGenrePayload>(event, `/genres/${id}`, {
    method: 'PATCH',
    body,
  })
})
