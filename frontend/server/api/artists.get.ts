import type { H3Event } from 'h3'
import type { PublicArtistListApiItem } from '~~/shared/api/public-artists'
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

function normalizeArtistsCatalogQuery(event: H3Event) {
  return withDefinedQuery({
    page: readPageQuery(event),
    limit: readLimitQuery(event, 24),
    search: readOptionalStringQuery(event, 'search'),
    genreId: readOptionalStringQuery(event, 'genreId'),
    country: readOptionalStringQuery(event, 'country'),
    isActive: readBooleanQuery(event, 'isActive'),
  })
}

const artistsListCachePolicy = createNormalizedQueryPublicApiPolicy<
  ApiPaginatedResponse<PublicArtistListApiItem>,
  ReturnType<typeof normalizeArtistsCatalogQuery>
>({
  prefix: 'artists',
  getNormalizedQuery: normalizeArtistsCatalogQuery,
  maxAge: 60,
  staleMaxAge: 300,
})

export default createCachedHandler(async (event) => {
  const normalizedQuery = normalizeArtistsCatalogQuery(event)
  const response = await proxyBackendRequest<
    ApiPaginatedResponse<PublicArtistListApiItem>
  >(event, '/artists', {
    method: 'GET',
    query: normalizedQuery,
  })

  return toUiPaginatedResponse(response)
}, artistsListCachePolicy)
