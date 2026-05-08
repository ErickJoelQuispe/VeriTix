import type { BackofficeRequiresAttentionRecord } from '~~/shared/types/backoffice'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<BackofficeRequiresAttentionRecord[]>(event, '/events/requires-attention', {
    method: 'GET',
  })
})
