import type { AdminRequiresAttentionRecord } from '~/types'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  return proxyBackendRequest<AdminRequiresAttentionRecord[]>(event, '/events/requires-attention', {
    method: 'GET',
  })
})
