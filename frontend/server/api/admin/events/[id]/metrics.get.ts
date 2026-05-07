import type { AdminEventMetrics } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing event id',
    })
  }

  return proxyBackendRequest<AdminEventMetrics>(event, `/events/${id}/metrics`, {
    method: 'GET',
  })
})
