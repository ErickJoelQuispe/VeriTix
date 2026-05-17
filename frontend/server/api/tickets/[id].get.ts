import type { UserTicketDetail } from '~~/shared/types'
import { createError, getRouterParam } from 'h3'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el identificador de la entrada.' })
  }

  return proxyBackendRequest<UserTicketDetail>(event, `/tickets/${id}`, {
    method: 'GET',
  })
})
