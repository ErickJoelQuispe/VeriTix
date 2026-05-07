import type { AdminArtistRecord, PaginatedResponse } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return proxyBackendRequest<PaginatedResponse<AdminArtistRecord>>(event, '/artists', {
    method: 'GET',
    query: {
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 50),
      search: typeof query.search === 'string' ? query.search : undefined,
      genreId: typeof query.genreId === 'string' ? query.genreId : undefined,
      country: typeof query.country === 'string' ? query.country : undefined,
      isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
    },
  })
})
