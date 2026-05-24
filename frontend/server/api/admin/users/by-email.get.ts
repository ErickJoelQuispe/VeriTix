import type { BackofficeUserRecord } from '~~/shared/types'
import { createError } from 'h3'
import { readOptionalStringQuery } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event): Promise<BackofficeUserRecord | null> => {
  const email = readOptionalStringQuery(event, 'email')

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el correo electrónico.' })
  }

  return proxyBackendRequest<BackofficeUserRecord | null>(event, '/users/by-email', {
    method: 'GET',
    query: { email: email.trim().toLowerCase() },
  })
})
