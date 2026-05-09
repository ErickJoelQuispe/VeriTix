import type { H3Event } from 'h3'
import type { PublicVenueListApiItem } from '~~/shared/api/public-venues'
import type { PaginatedResponse as ApiPaginatedResponse } from '~~/shared/api/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { createCachedHandler } from '~~/server/utils/cache/create-cached-handler'
import { createNormalizedQueryPublicApiPolicy } from '~~/server/utils/cache/policies/public-api'
import {
  readBooleanQuery,
  readLimitQuery,
  readOptionalStringQuery,
  readPageQuery,
  withDefinedQuery,
} from '~~/server/utils/request'
import { toUiPaginatedResponse } from '~~/shared/api/pagination'

function normalizeVenuesCatalogQuery(event: H3Event) {
  return withDefinedQuery({
    page: readPageQuery(event),
    limit: readLimitQuery(event, 24),
    search: readOptionalStringQuery(event, 'search'),
    city: readOptionalStringQuery(event, 'city'),
    type: readOptionalStringQuery(event, 'type'),
    isActive: readBooleanQuery(event, 'isActive'),
  })
}

const venuesCachePolicy = createNormalizedQueryPublicApiPolicy<
  ApiPaginatedResponse<PublicVenueListApiItem>,
  ReturnType<typeof normalizeVenuesCatalogQuery>
>({
  prefix: 'venues',
  getNormalizedQuery: normalizeVenuesCatalogQuery,
  maxAge: 60,
  staleMaxAge: 300,
})

export default createCachedHandler(async (event) => {
  const normalizedQuery = normalizeVenuesCatalogQuery(event)
  const response = await proxyBackendRequest<
    ApiPaginatedResponse<PublicVenueListApiItem>
  >(event, '/venues', {
    method: 'GET',
    query: normalizedQuery,
  })

  return toUiPaginatedResponse(response)
}, venuesCachePolicy)
