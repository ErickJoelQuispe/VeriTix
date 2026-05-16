import type { Review } from '~~/shared/types/my-events'
import { readBody } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return proxyBackendRequest<Review>(event, '/reviews', {
    method: 'POST',
    body,
  })
})
