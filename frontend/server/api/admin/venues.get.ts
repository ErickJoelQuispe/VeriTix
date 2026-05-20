import type { PaginatedResponse } from '~~/shared/api/types'
import type { BackofficeVenueRecord } from '~~/shared/types'
import { readBooleanQuery, readLimitQuery, readOptionalStringQuery, readPageQuery, withDefinedQuery } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<BackofficeVenueRecord>>(event, '/venues', {
    method: 'GET',
    query: withDefinedQuery({
      page: readPageQuery(event),
      limit: readLimitQuery(event, 50),
      search: readOptionalStringQuery(event, 'search'),
      city: readOptionalStringQuery(event, 'city'),
      isActive: readBooleanQuery(event, 'isActive'),
    }),
  })
})
