import type { BackofficeEventDetail } from '~~/shared/types/backoffice'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'event')

  return proxyBackendRequest<BackofficeEventDetail>(event, `/events/${id}/publish`, {
    method: 'POST',
  })
})
