import type { BackofficeGenreRecord } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<BackofficeGenreRecord[]>(event, '/genres', {
    method: 'GET',
  })
})
