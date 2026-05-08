import type { BackofficeTopEventRecord } from '~~/shared/types/backoffice'
import { readLimitQuery } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<BackofficeTopEventRecord[]>(event, '/events/top-events', {
    method: 'GET',
    query: {
      limit: readLimitQuery(event, 5, 50),
    },
  })
})
