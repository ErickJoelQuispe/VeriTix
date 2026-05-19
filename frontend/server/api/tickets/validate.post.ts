import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return proxyBackendRequest(event, '/tickets/validate', {
    method: 'POST',
    body,
  })
})
