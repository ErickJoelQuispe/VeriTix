import type { AdminArtistRecord } from '~/types'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'artist')

  return proxyBackendRequest<AdminArtistRecord>(event, `/artists/${id}`, {
    method: 'GET',
  })
})
