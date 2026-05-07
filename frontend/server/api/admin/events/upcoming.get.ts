import type { AdminUpcomingEventRecord } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return proxyBackendRequest<AdminUpcomingEventRecord[]>(event, '/events/upcoming', {
    method: 'GET',
    query: {
      limit: Number(query.limit ?? 5),
    },
  })
})
