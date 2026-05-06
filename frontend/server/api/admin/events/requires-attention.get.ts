import type { BackofficeRequiresAttentionRecord } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<BackofficeRequiresAttentionRecord[]>(event, '/events/requires-attention', {
    method: 'GET',
  })
})
