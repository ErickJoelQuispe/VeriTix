import type { BackofficeUpcomingEventRecord } from '~~/shared/types/backoffice'
import { readLimitQuery } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<BackofficeUpcomingEventRecord[]>(event, '/events/upcoming', {
    method: 'GET',
    query: {
      limit: readLimitQuery(event, 5, 50),
    },
  })
})
