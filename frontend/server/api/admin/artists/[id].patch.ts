import type { AdminArtistPayload, AdminArtistRecord } from '~/types'
import { readRequiredBodyObject, requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'artist')
  const body = await readRequiredBodyObject<Partial<AdminArtistPayload>>(event)

  return proxyBackendRequest<AdminArtistRecord, Partial<AdminArtistPayload>>(event, `/artists/${id}`, {
    method: 'PATCH',
    body,
  })
})
