export function buildAuthHeaders(accessToken: string | null, required: true): HeadersInit
export function buildAuthHeaders(accessToken: string | null, required?: false): HeadersInit | undefined
export function buildAuthHeaders(accessToken: string | null, required = false): HeadersInit | undefined {
  if (!accessToken) {
    if (required) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Missing access token',
      })
    }

    return undefined
  }

  return {
    authorization: `Bearer ${accessToken}`,
  }
}
