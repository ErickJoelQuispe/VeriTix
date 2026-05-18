import type { H3Event } from 'h3'
import type { PublicEventListApiItem } from '~~/shared/api/public-events'
import type { PaginatedResponse as ApiPaginatedResponse } from '~~/shared/api/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { createCachedHandler } from '~~/server/utils/cache/create-cached-handler'
import { createNormalizedQueryPublicApiPolicy } from '~~/server/utils/cache/policies/public-api'
import {
  readLimitQuery,
  readOptionalStringQuery,
  readPageQuery,
  withDefinedQuery,
} from '~~/server/utils/request'

function normalizeEventsCatalogQuery(event: H3Event) {
  return withDefinedQuery({
    page: readPageQuery(event),
    limit: readLimitQuery(event, 24),
    city: readOptionalStringQuery(event, 'city'),
    genreId: readOptionalStringQuery(event, 'genreId'),
    formatId: readOptionalStringQuery(event, 'formatId'),
    dateFrom: readOptionalStringQuery(event, 'dateFrom'),
    dateTo: readOptionalStringQuery(event, 'dateTo'),
    search: readOptionalStringQuery(event, 'search'),
    artistName: readOptionalStringQuery(event, 'artistName'),
    venueName: readOptionalStringQuery(event, 'venueName'),
  })
}

const eventsListCachePolicy = createNormalizedQueryPublicApiPolicy<
  ApiPaginatedResponse<PublicEventListApiItem>,
  ReturnType<typeof normalizeEventsCatalogQuery>
>({
  prefix: 'events',
  getNormalizedQuery: normalizeEventsCatalogQuery,
  maxAge: 60,
  staleMaxAge: 300,
})

export default createCachedHandler(async (event) => {
  const normalizedQuery = normalizeEventsCatalogQuery(event)
  const response = await proxyBackendRequest<
    ApiPaginatedResponse<PublicEventListApiItem>
  >(event, '/events', {
    method: 'GET',
    query: normalizedQuery,
  })

  return response
}, eventsListCachePolicy)
