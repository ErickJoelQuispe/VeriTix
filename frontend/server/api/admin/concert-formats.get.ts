import type { BackofficeFormatRecord } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<BackofficeFormatRecord[]>(event, '/concert-formats', {
    method: 'GET',
  })
})
