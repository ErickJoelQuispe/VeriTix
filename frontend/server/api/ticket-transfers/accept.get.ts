import type { TransferResult, TransferRequiresRegistration } from '~~/shared/types/my-events'
import { getQuery } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)

  return proxyBackendRequest<TransferResult | TransferRequiresRegistration>(event, '/ticket-transfers/accept', {
    method: 'GET',
    query: { token: String(token) },
  })
})
