import type { BackofficeArtistPayload, BackofficeArtistRecord } from '~~/shared/types'
import { readRequiredBodyObject, requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'artist')
  const body = await readRequiredBodyObject<Partial<BackofficeArtistPayload>>(event)

  return proxyBackendRequest<BackofficeArtistRecord, Partial<BackofficeArtistPayload>>(event, `/artists/${id}`, {
    method: 'PATCH',
    body,
  })
})
