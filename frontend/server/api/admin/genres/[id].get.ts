import type { BackofficeGenreRecord } from '~~/shared/types'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'genre')

  return proxyBackendRequest<BackofficeGenreRecord>(event, `/genres/${id}`, {
    method: 'GET',
  })
})
