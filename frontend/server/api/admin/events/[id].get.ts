import type { BackofficeEventDetail } from '~~/shared/types'
import { requireRouteId } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = requireRouteId(event, 'event')

  try {
    return await proxyBackendRequest<BackofficeEventDetail>(event, `/events/${id}/admin-detail`, {
      method: 'GET',
    })
  }
  catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode

    if (statusCode !== 404) {
      throw error
    }

    try {
      return await proxyBackendRequest<BackofficeEventDetail>(event, `/admin/events/${id}`, {
        method: 'GET',
      })
    }
    catch (fallbackError) {
      const fallbackStatusCode = (fallbackError as { statusCode?: number }).statusCode

      if (fallbackStatusCode !== 404) {
        throw fallbackError
      }

      return proxyBackendRequest<BackofficeEventDetail>(event, `/events/${id}`, {
        method: 'GET',
      })
    }
  }
})
