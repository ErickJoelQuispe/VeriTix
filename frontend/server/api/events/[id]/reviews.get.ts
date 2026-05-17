import type { ReviewsResponse } from '~~/shared/types/my-events'
import { createError, getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'
import { readLimitQuery, readPageQuery, withDefinedQuery } from '~~/server/utils/request'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador del evento.' })
  }

  return proxyBackendRequest<ReviewsResponse>(event, `/events/${id}/reviews`, {
    method: 'GET',
    query: withDefinedQuery({
      page: readPageQuery(event),
      limit: readLimitQuery(event, 10),
    }),
  })
})
