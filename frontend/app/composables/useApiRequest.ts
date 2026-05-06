import type { UserProfile } from '~~/shared/types'

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
  const sessionStatus = useState<'unknown' | 'authenticated' | 'anonymous'>('auth-session-status', () => 'unknown')
  const requestHeaders = import.meta.server ? useRequestHeaders(['authorization', 'cookie']) : null

  function resolveHeaders(path: string, headers?: HeadersInit | (() => HeadersInit)) {
    const resolved = normalizeHeaders(headers)

    if (!path.startsWith('/auth/') && accessToken.value && !resolved.has('authorization')) {
      resolved.set('authorization', `Bearer ${accessToken.value}`)
    }

    if (import.meta.server && requestHeaders) {
      if (requestHeaders.authorization && !resolved.has('authorization')) {
        resolved.set('authorization', requestHeaders.authorization)
      }

      if (requestHeaders.cookie && !resolved.has('cookie')) {
        resolved.set('cookie', requestHeaders.cookie)
      }
    }

    return resolved
  }

  async function callApi<TResponse, TBody extends BodyInit | object | null = Record<string, unknown>>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const shouldRetryAuth = import.meta.client
      && !options.skipAuthRefresh
      && !path.startsWith('/auth/')
      && (Boolean(accessToken.value) || sessionStatus.value !== 'anonymous')

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

      const response = await $fetch.raw(apiUrl, {
        method: options.method,
        body: options.body,
        headers,
        query: options.query,
        credentials: 'include' as const,
        retry: 0,
        timeout: options.timeoutMs ?? timeout,
      })

      return response._data
    }

    try {
      const response: unknown = await executeRequest()
      return response as TResponse
    }
    catch (error) {
      if (shouldRetryAuth && getApiErrorStatus(error) === 401) {
        try {
          const { refreshSession } = useAuth()
          const refreshed = await refreshSession()

          if (!refreshed) {
            accessToken.value = null
            user.value = null
            sessionStatus.value = 'anonymous'
            throw markApiSessionExpiredError(error)
          }

          accessToken.value = refreshed.accessToken
          user.value = refreshed.user
          sessionStatus.value = 'authenticated'

          try {
            const retryHeaders = resolveHeaders(path, options.headers)

            const retryResponse = await $fetch.raw(apiUrl, {
              method: options.method,
              body: options.body,
              headers: retryHeaders,
              query: options.query,
              credentials: 'include' as const,
              retry: 0,
              timeout: options.timeoutMs ?? timeout,
            })

            return retryResponse._data as TResponse
          }
          catch (retryError) {
            if (getApiErrorStatus(retryError) === 401) {
              accessToken.value = null
              user.value = null
              sessionStatus.value = 'anonymous'
              throw markApiSessionExpiredError(retryError)
            }

            throw retryError
          }
        }
        catch (refreshError) {
          if (getApiErrorStatus(refreshError) === 401) {
            accessToken.value = null
            user.value = null
            sessionStatus.value = 'anonymous'
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
