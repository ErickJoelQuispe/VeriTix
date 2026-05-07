import type { AuthResponse, UserProfile } from '~~/shared/types'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

type ApiQueryValue = string | number | boolean | undefined

const TRAILING_SLASH_REGEX = /\/$/

interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod
  body?: TBody
  headers?: HeadersInit | (() => HeadersInit)
  query?: Record<string, ApiQueryValue>
  timeoutMs?: number
  skipAuthRefresh?: boolean
}

function normalizeHeaders(headers?: HeadersInit | (() => HeadersInit)): Headers {
  return new Headers(typeof headers === 'function' ? headers() : headers)
}

export function useApiRequest() {
  const config = useRuntimeConfig()
  const { getApiErrorStatus, markApiSessionExpiredError } = useApiErrorMessage()
  const accessToken = useState<string | null>('auth-access-token', () => null)
  const user = useState<UserProfile | null>('auth-user', () => null)
  const requestHeaders = import.meta.server ? useRequestHeaders(['authorization', 'cookie']) : null

  function resolveHeaders(path: string, headers?: HeadersInit | (() => HeadersInit)) {
    const resolved = normalizeHeaders(headers)

    if (import.meta.server && requestHeaders) {
      if (requestHeaders.authorization && !resolved.has('authorization')) {
        resolved.set('authorization', requestHeaders.authorization)
      }

      if (requestHeaders.cookie && !resolved.has('cookie')) {
        resolved.set('cookie', requestHeaders.cookie)
      }
    }

    if (import.meta.client && !path.startsWith('/auth/') && accessToken.value) {
      resolved.set('authorization', `Bearer ${accessToken.value}`)
    }

    return resolved
  }

  async function callApi<TResponse, TBody extends BodyInit | object | null = Record<string, unknown>>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const shouldRetryAuth = import.meta.client && !options.skipAuthRefresh && !path.startsWith('/auth/')

    const origin = import.meta.server ? useRequestURL().origin : window.location.origin
    const apiBaseUrl = new URL(config.public.apiBase, origin).toString().replace(TRAILING_SLASH_REGEX, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const apiUrl = `${apiBaseUrl}${normalizedPath}`
    const configuredTimeout = Number(config.public.apiTimeoutMs ?? 8000)
    const timeout = Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : 8000

    const executeRequest = async () => {
      const headers = resolveHeaders(path, options.headers)

      return await $fetch(apiUrl, {
        method: options.method,
        body: options.body,
        headers,
        query: options.query,
        credentials: 'include' as const,
        retry: 0,
        timeout: options.timeoutMs ?? timeout,
      })
    }

    try {
      const response: unknown = await executeRequest()
      return response as TResponse
    }
    catch (error) {
      if (shouldRetryAuth && getApiErrorStatus(error) === 401) {
        try {
          const refreshed = await callApi<AuthResponse>('/auth/refresh', {
            method: 'POST',
            skipAuthRefresh: true,
          })

          accessToken.value = refreshed.accessToken
          user.value = refreshed.user

          try {
            const response: unknown = await executeRequest()
            return response as TResponse
          }
          catch (retryError) {
            if (getApiErrorStatus(retryError) === 401) {
              accessToken.value = null
              user.value = null
              throw markApiSessionExpiredError(retryError)
            }

            throw retryError
          }
        }
        catch (refreshError) {
          if (getApiErrorStatus(refreshError) === 401) {
            accessToken.value = null
            user.value = null
            throw markApiSessionExpiredError(error)
          }

          throw refreshError
        }
      }

      throw error
    }
  }

  return callApi
}
