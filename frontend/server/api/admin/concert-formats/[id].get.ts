import type { BackofficeFormatRecord } from '~~/shared/types'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'format')

  return proxyBackendRequest<BackofficeFormatRecord>(event, `/concert-formats/${id}`, {
    method: 'GET',
  })
})
