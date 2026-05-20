import type { CreateOrderResponse } from '~~/shared/api/orders'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { readRequiredBodyObject } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<Record<string, unknown>>(event)

  return proxyBackendRequest<CreateOrderResponse>(event, '/orders', {
    method: 'POST',
    body,
  })
})
