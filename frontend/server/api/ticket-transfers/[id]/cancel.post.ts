import { createError, getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador de la transferencia.' })
  }

  return proxyBackendRequest<void>(event, `/ticket-transfers/${id}/cancel`, {
    method: 'POST',
  })
})
