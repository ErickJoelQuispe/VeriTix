import type { H3Event } from 'h3'
import type { PaginatedResponse } from '~/types'
import { getQuery } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { createCachedHandler } from '~~/server/utils/cache/create-cached-handler'
import { createNormalizedQueryPublicApiPolicy } from '~~/server/utils/cache/policies/public-api'

function getQueryValue(event: H3Event, key: string): string | undefined {
  const value = getQuery(event)[key]

  if (Array.isArray(value)) {
    return value[0]?.toString()
  }

  return value?.toString()
}

function normalizeEventsCatalogQuery(event: H3Event) {
  return {
    page: getQueryValue(event, 'page'),
    limit: getQueryValue(event, 'limit'),
    city: getQueryValue(event, 'city'),
    genreId: getQueryValue(event, 'genreId'),
    formatId: getQueryValue(event, 'formatId'),
    dateFrom: getQueryValue(event, 'dateFrom'),
    dateTo: getQueryValue(event, 'dateTo'),
    search: getQueryValue(event, 'search'),
  }
}

const eventsListCachePolicy = createNormalizedQueryPublicApiPolicy<PaginatedResponse<unknown>, ReturnType<typeof normalizeEventsCatalogQuery>>({
  prefix: 'events',
  getNormalizedQuery: normalizeEventsCatalogQuery,
  maxAge: 60,
  staleMaxAge: 300,
})

export default createCachedHandler(async (event) => {
  const normalizedQuery = normalizeEventsCatalogQuery(event)

  return proxyBackendRequest<PaginatedResponse<unknown>>(event, '/events', {
    method: 'GET',
    query: normalizedQuery,
  })
}, eventsListCachePolicy)
