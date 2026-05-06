import type { AdminArtistPayload, AdminArtistRecord } from '~/types'
import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<AdminArtistPayload>(event)

  return proxyBackendRequest<AdminArtistRecord, AdminArtistPayload>(event, '/artists', {
    method: 'POST',
    body,
  })
})
