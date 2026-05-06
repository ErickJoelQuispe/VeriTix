import type { AdminArtistRecord, PaginatedResponse } from '~/types'
import { readBooleanQuery, readLimitQuery, readOptionalStringQuery, readPageQuery, withDefinedQuery } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<AdminArtistRecord>>(event, '/artists', {
    method: 'GET',
    query: withDefinedQuery({
      page: readPageQuery(event),
      limit: readLimitQuery(event, 50),
      search: readOptionalStringQuery(event, 'search'),
      genreId: readOptionalStringQuery(event, 'genreId'),
      country: readOptionalStringQuery(event, 'country'),
      isActive: readBooleanQuery(event, 'isActive'),
    }),
  })
})
