import type { AdminEventRecord, PaginatedResponse } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return proxyBackendRequest<PaginatedResponse<AdminEventRecord>>(event, '/events', {
    method: 'GET',
    query: {
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 50),
      search: typeof query.search === 'string' ? query.search : undefined,
      city: typeof query.city === 'string' ? query.city : undefined,
      genreId: typeof query.genreId === 'string' ? query.genreId : undefined,
      formatId: typeof query.formatId === 'string' ? query.formatId : undefined,
      dateFrom: typeof query.dateFrom === 'string' ? query.dateFrom : undefined,
      dateTo: typeof query.dateTo === 'string' ? query.dateTo : undefined,
      artistName: typeof query.artistName === 'string' ? query.artistName : undefined,
    },
  })
})
