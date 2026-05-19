import { readRequiredBodyObject } from '~~/server/utils/admin/request'
import { proxyBackendRequest } from '~~/server/utils/backend-proxy'

interface SignUploadBody {
  folder: 'events' | 'artists' | 'venues'
}

export default defineEventHandler(async (event) => {
  const body = await readRequiredBodyObject<SignUploadBody>(event)

  return proxyBackendRequest(event, '/uploads/sign', {
    method: 'POST',
    body,
  })
})
