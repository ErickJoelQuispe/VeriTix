import type { PublicEventArtistApiItem } from '~~/shared/api/public-events'
import { createError, getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { createCachedHandler } from '~~/server/utils/cache/create-cached-handler'
import { createRouteParamPublicApiPolicy } from '~~/server/utils/cache/policies/public-api'

const eventArtistsCachePolicy = createRouteParamPublicApiPolicy<PublicEventArtistApiItem[]>({
  prefix: 'event-artists',
  param: 'id',
  maxAge: 120,
  staleMaxAge: 600,
})

export default createCachedHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')

  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador del evento.' })
  }

  return proxyBackendRequest<PublicEventArtistApiItem[]>(event, `/events/${eventId}/artists`, {
    method: 'GET',
  })
}, eventArtistsCachePolicy)
