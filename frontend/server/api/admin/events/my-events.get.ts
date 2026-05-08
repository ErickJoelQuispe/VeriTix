import type { PaginatedResponse } from '~~/shared/api/types'
import type { BackofficeEventRecord } from '~~/shared/types'
import { readLimitQuery, readPageQuery } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<BackofficeEventRecord>>(event, '/events/my-events', {
    method: 'GET',
    query: {
      page: readPageQuery(event),
      limit: readLimitQuery(event, 6),
    },
  })
})
