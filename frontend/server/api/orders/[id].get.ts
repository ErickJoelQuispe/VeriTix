import type { OrderDetailApiItem } from '~~/shared/api/orders'
import { createError, getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador de la orden.' })
  }

  return proxyBackendRequest<OrderDetailApiItem>(event, `/orders/${id}`, {
    method: 'GET',
  })
})
