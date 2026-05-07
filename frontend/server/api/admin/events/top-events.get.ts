import type { AdminTopEventRecord } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return proxyBackendRequest<AdminTopEventRecord[]>(event, '/events/top-events', {
    method: 'GET',
    query: {
      limit: Number(query.limit ?? 5),
    },
  })
})
