import type { PaginatedResponse } from '~~/shared/api/types'
import type { FavoriteItem } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { readLimitQuery, readPageQuery } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<FavoriteItem>>(event, '/favorites/events', {
    method: 'GET',
    query: {
      page: readPageQuery(event),
      limit: readLimitQuery(event, 20),
    },
  })
})
