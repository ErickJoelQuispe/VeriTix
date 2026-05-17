import type { TransferResult } from '~~/shared/types/my-events'
import { readBody } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return proxyBackendRequest<TransferResult>(event, '/ticket-transfers/complete-after-register', {
    method: 'POST',
    body,
  })
})
