import type { PaginatedResponse } from '~~/shared/api/types'
import type { UserTicket } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { readLimitQuery, readPageQuery, withDefinedQuery } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  const query = withDefinedQuery({
    page: readPageQuery(event),
    limit: readLimitQuery(event, 12),
  })

  return proxyBackendRequest<PaginatedResponse<UserTicket>>(event, '/tickets/mine', {
    method: 'GET',
    query,
  })
})
