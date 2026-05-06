import type { AdminEventRecord, PaginatedResponse } from '~/types'
import { readLimitQuery, readOptionalStringQuery, readPageQuery, withDefinedQuery } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<AdminEventRecord>>(event, '/events', {
    method: 'GET',
    query: withDefinedQuery({
      page: readPageQuery(event),
      limit: readLimitQuery(event, 50),
      search: readOptionalStringQuery(event, 'search'),
      city: readOptionalStringQuery(event, 'city'),
      genreId: readOptionalStringQuery(event, 'genreId'),
      formatId: readOptionalStringQuery(event, 'formatId'),
      dateFrom: readOptionalStringQuery(event, 'dateFrom'),
      dateTo: readOptionalStringQuery(event, 'dateTo'),
      artistName: readOptionalStringQuery(event, 'artistName'),
    }),
  })
})
