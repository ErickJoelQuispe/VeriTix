import type { BackofficeArtistPayload, BackofficeArtistRecord } from '~/types'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<BackofficeArtistPayload>(event)

  return proxyBackendRequest<BackofficeArtistRecord, BackofficeArtistPayload>(event, '/artists', {
    method: 'POST',
    body,
  })
})
