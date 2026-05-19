import type { EventOrderListApiItem } from '~~/shared/api/orders'
import type { PaginatedResponse } from '~~/shared/api/types'
import { getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { readLimitQuery, readOptionalStringQuery, readPageQuery, withDefinedQuery } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'eventId')

  return proxyBackendRequest<PaginatedResponse<EventOrderListApiItem>>(event, `/orders/event/${eventId}`, {
    method: 'GET',
    query: withDefinedQuery({
      status: readOptionalStringQuery(event, 'status'),
      page: readPageQuery(event),
      limit: readLimitQuery(event, 20),
    }),
  })
})
