import type { OrderListApiItem } from '~~/shared/api/orders'
import type { PaginatedResponse } from '~~/shared/api/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { readLimitQuery, readPageQuery, withDefinedQuery } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<OrderListApiItem>>(event, '/orders/my', {
    method: 'GET',
    query: withDefinedQuery({
      page: readPageQuery(event),
      limit: readLimitQuery(event, 12),
    }),
  })
})
