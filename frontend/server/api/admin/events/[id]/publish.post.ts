import type { AdminEventDetail } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing event id',
    })
  }

  return proxyBackendRequest<AdminEventDetail>(event, `/events/${id}/publish`, {
    method: 'POST',
  })
})
