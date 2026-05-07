import type { AdminOption } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { createCachedHandler } from '~~/server/utils/cache/create-cached-handler'
import { createStaticPublicApiPolicy } from '~~/server/utils/cache/policies/public-api'

interface ConcertFormatOption {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
}

const formatsCachePolicy = createStaticPublicApiPolicy<AdminOption[]>({
  key: 'concert-formats:page=1:limit=100:isActive=true',
  maxAge: 1800,
  staleMaxAge: 21600,
})

export default createCachedHandler(async (event) => {
  const response = await proxyBackendRequest<ConcertFormatOption[]>(event, '/concert-formats', {
    method: 'GET',
    query: {
      page: 1,
      limit: 100,
      isActive: true,
    },
  })

  return response.map(format => ({
    id: format.id,
    name: format.name,
  }))
}, formatsCachePolicy)
