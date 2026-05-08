import type { BackofficeUserRecord, PaginatedResponse } from '~~/shared/types'
import { readBooleanQuery, readLimitQuery, readOptionalStringQuery, readPageQuery, withDefinedQuery } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<BackofficeUserRecord>>(event, '/users', {
    method: 'GET',
    query: withDefinedQuery({
      page: readPageQuery(event),
      limit: readLimitQuery(event, 50),
      search: readOptionalStringQuery(event, 'search'),
      role: readOptionalStringQuery(event, 'role'),
      isActive: readBooleanQuery(event, 'isActive'),
    }),
  })
})
