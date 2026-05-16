import type { MyEventsResponse } from '~~/shared/types/my-events'
import { getQuery } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { readLimitQuery, readPageQuery, withDefinedQuery } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  const { upcoming } = getQuery(event)

  return proxyBackendRequest<MyEventsResponse>(event, '/events/mine', {
    method: 'GET',
    query: withDefinedQuery({
      upcoming: upcoming !== undefined ? String(upcoming) : 'true',
      page: readPageQuery(event),
      limit: readLimitQuery(event, 20),
    }),
  })
})
