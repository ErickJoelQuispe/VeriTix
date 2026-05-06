import type { BackofficeUserRecord } from '~/types'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'user')

  return proxyBackendRequest<BackofficeUserRecord>(event, `/users/${id}`, {
    method: 'GET',
  })
})
