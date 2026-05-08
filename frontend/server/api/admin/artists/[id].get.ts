import type { BackofficeArtistRecord } from '~~/shared/types/backoffice'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'artist')

  return proxyBackendRequest<BackofficeArtistRecord>(event, `/artists/${id}`, {
    method: 'GET',
  })
})
