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

interface PreparedRequest {
  path: string
  url: string
  timeout: number
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
    const shouldAttachClientAuth = path === '/auth/logout' || !path.startsWith('/auth/')

    if (shouldAttachClientAuth && accessToken.value && !resolved.has('authorization')) {
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

  function prepareRequest(path: string, timeoutOverride?: number): PreparedRequest {
    const origin = import.meta.server ? useRequestURL().origin : window.location.origin
    const apiBaseUrl = new URL(config.public.apiBase, origin).toString().replace(TRAILING_SLASH_REGEX, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const configuredTimeout = Number(config.public.apiTimeoutMs ?? 8000)
    const timeout = Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : 8000

    return {
      path: normalizedPath,
      url: `${apiBaseUrl}${normalizedPath}`,
      timeout: timeoutOverride ?? timeout,
    }
  }

  async function executeRequest<TResponse, TBody extends BodyInit | object | null>(
    request: PreparedRequest,
    options: ApiRequestOptions<TBody>,
  ): Promise<TResponse> {
    const headers = resolveHeaders(request.path, options.headers)
    const response = await $fetch.raw(request.url, {
      method: options.method,
      body: options.body,
      headers,
      query: options.query,
      credentials: 'include' as const,
      retry: 0,
      timeout: request.timeout,
    })

    return response._data as TResponse
  }

  function markAnonymousSession() {
    accessToken.value = null
    user.value = null
    sessionStatus.value = 'anonymous'
  }

  async function retryAfterRefresh<TResponse, TBody extends BodyInit | object | null>(
    request: PreparedRequest,
    options: ApiRequestOptions<TBody>,
    sourceError: unknown,
  ): Promise<TResponse> {
    try {
      const { refreshSession } = useAuth()
      const refreshed = await refreshSession()

      if (!refreshed) {
        markAnonymousSession()
        throw markApiSessionExpiredError(sourceError)
      }

      accessToken.value = refreshed.accessToken
      user.value = refreshed.user
      sessionStatus.value = 'authenticated'

      try {
        return await executeRequest<TResponse, TBody>(request, options)
      }
      catch (retryError) {
        if (getApiErrorStatus(retryError) === 401) {
          markAnonymousSession()
          throw markApiSessionExpiredError(retryError)
        }

        throw retryError
      }
    }
    catch (refreshError) {
      if (getApiErrorStatus(refreshError) === 401) {
        markAnonymousSession()
        throw markApiSessionExpiredError(sourceError)
      }

      throw refreshError
    }
  }

  async function callApi<TResponse, TBody extends BodyInit | object | null = Record<string, unknown>>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ): Promise<TResponse> {
    const shouldRetryAuth = import.meta.client
      && !options.skipAuthRefresh
      && !path.startsWith('/auth/')
      && (Boolean(accessToken.value) || sessionStatus.value !== 'anonymous')

    const request = prepareRequest(path, options.timeoutMs)

    try {
      return await executeRequest<TResponse, TBody>(request, options)
    }
    catch (error) {
      if (shouldRetryAuth && getApiErrorStatus(error) === 401) {
        return retryAfterRefresh<TResponse, TBody>(request, options, error)
      }

      throw error
    }
  }

  return callApi
}
