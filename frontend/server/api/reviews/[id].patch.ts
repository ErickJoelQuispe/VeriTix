import type { Review } from '~~/shared/types/my-events'
import { createError, getRouterParam, readBody } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador de la reseña.' })
  }

  const body = await readBody(event)

  return proxyBackendRequest<Review>(event, `/reviews/${id}`, {
    method: 'PATCH',
    body,
  })
})
