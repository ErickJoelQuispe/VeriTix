import type { AdminEventRecord, PaginatedResponse } from '~/types'
import { readLimitQuery, readPageQuery } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<AdminEventRecord>>(event, '/events/my-events', {
    method: 'GET',
    query: {
      page: readPageQuery(event),
      limit: readLimitQuery(event, 6),
    },
  })
})
