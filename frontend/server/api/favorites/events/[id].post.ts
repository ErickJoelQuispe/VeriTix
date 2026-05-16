import type { FavoriteStatus } from '~~/shared/types/my-events'
import { createError, getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador del evento.' })
  }

  return proxyBackendRequest<FavoriteStatus>(event, `/favorites/events/${id}`, {
    method: 'POST',
  })
})
