import type { PaginatedResponse, VenueOption } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { createCachedHandler } from '~~/server/utils/cache/create-cached-handler'
import { createStaticPublicApiPolicy } from '~~/server/utils/cache/policies/public-api'

const venuesCachePolicy = createStaticPublicApiPolicy<PaginatedResponse<VenueOption>>({
  key: 'venues:page=1:limit=100:isActive=true',
  maxAge: 1800,
  staleMaxAge: 21600,
})

export default createCachedHandler(async (event) => {
  return proxyBackendRequest<PaginatedResponse<VenueOption>>(event, '/venues', {
    method: 'GET',
    query: {
      page: 1,
      limit: 100,
      isActive: true,
    },
  })
}, venuesCachePolicy)
