import type { PaginatedResponse as ApiPaginatedResponse } from '~~/shared/api/types'
import type { VenueOption } from '~~/shared/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { createCachedHandler } from '~~/server/utils/cache/create-cached-handler'
import { createStaticPublicApiPolicy } from '~~/server/utils/cache/policies/public-api'
import { withDefinedQuery } from '~~/server/utils/request'
import { toUiPaginatedResponse } from '~~/shared/api/pagination'

const venuesCachePolicy = createStaticPublicApiPolicy<ApiPaginatedResponse<VenueOption>>({
  key: 'venues:page=1:limit=100:isActive=true',
  maxAge: 1800,
  staleMaxAge: 21600,
})

export default createCachedHandler(async (event) => {
  const response = await proxyBackendRequest<ApiPaginatedResponse<VenueOption>>(event, '/venues', {
    method: 'GET',
    query: withDefinedQuery({
      page: 1,
      limit: 100,
      isActive: true,
    }),
  })

  return toUiPaginatedResponse({
    ...response,
    data: response.data.map(venue => ({
      id: venue.id,
      name: venue.name,
      city: venue.city,
    })),
  })
}, venuesCachePolicy)
