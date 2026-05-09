import type { PublicArtistDetailApiItem } from '~~/shared/api/public-artists'
import { createError, getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { createCachedHandler } from '~~/server/utils/cache/create-cached-handler'
import { createRouteParamPublicApiPolicy } from '~~/server/utils/cache/policies/public-api'

const artistDetailCachePolicy = createRouteParamPublicApiPolicy<PublicArtistDetailApiItem>({
  prefix: 'artist',
  param: 'id',
  maxAge: 120,
  staleMaxAge: 600,
})

export default createCachedHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador del artista.' })
  }

  return proxyBackendRequest<PublicArtistDetailApiItem>(event, `/artists/${id}`, {
    method: 'GET',
  })
}, artistDetailCachePolicy)
