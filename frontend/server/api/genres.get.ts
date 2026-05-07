import type { GenreOption } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { createCachedHandler } from '~~/server/utils/cache/create-cached-handler'
import { createStaticPublicApiPolicy } from '~~/server/utils/cache/policies/public-api'

const genresCachePolicy = createStaticPublicApiPolicy<GenreOption[]>({
  key: 'genres',
  maxAge: 3600,
  staleMaxAge: 86400,
})

export default createCachedHandler(async (event) => {
  return proxyBackendRequest<GenreOption[]>(event, '/genres', {
    method: 'GET',
  })
}, genresCachePolicy)
