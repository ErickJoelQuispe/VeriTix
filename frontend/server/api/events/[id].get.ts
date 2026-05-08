import type { PublicEventDetailApiItem } from '~~/shared/api/public-events'
import { createError, getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { createCachedHandler } from '~~/server/utils/cache/create-cached-handler'
import { createRouteParamPublicApiPolicy } from '~~/server/utils/cache/policies/public-api'

const eventDetailCachePolicy = createRouteParamPublicApiPolicy<PublicEventDetailApiItem>({
  prefix: 'event',
  param: 'id',
  maxAge: 120,
  staleMaxAge: 600,
})

export default createCachedHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador del evento.' })
  }

  return proxyBackendRequest<PublicEventDetailApiItem>(event, `/events/${id}`, {
    method: 'GET',
  })
}, eventDetailCachePolicy)
