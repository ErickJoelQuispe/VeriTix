import type { H3Event } from 'h3'
import type { ApiErrorPayload } from '~~/shared/types'
import { appendResponseHeader, createError, getHeader, setResponseStatus } from 'h3'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface ProxyRequestOptions<TBody extends BodyInit | object | null = Record<string, unknown>> {
  method?: HttpMethod
  body?: TBody
  query?: Record<string, string | number | boolean | undefined>
  headers?: HeadersInit
}

interface FetchLikeError<TData = unknown> extends Error {
  statusCode?: number
  response?: {
    status?: number
  }
  data?: TData
}

function getErrorMessage(data: ApiErrorPayload | undefined, fallback: string): string {
  if (!data) {
    return fallback
  }

  if (Array.isArray(data.message)) {
    return data.message.join(', ')
  }

  if (typeof data.message === 'string' && data.message.length > 0) {
    return data.message
  }

  if (data.error) {
    return data.error
  }

  return fallback
}

function normalizeBackendError(error: unknown): never {
  const fetchError = error as FetchLikeError<ApiErrorPayload>

  const statusCode = fetchError.response?.status ?? fetchError.statusCode ?? 500
  const fallback = fetchError.message || 'Unexpected backend error'

  throw createError({
    statusCode,
    statusMessage: getErrorMessage(fetchError.data, fallback),
    data: fetchError.data,
  })
}

function buildProxyHeaders(event: H3Event, headersInit?: HeadersInit): Headers {
  const headers = new Headers(headersInit)

  const cookieHeader = getHeader(event, 'cookie')
  if (cookieHeader && !headers.has('cookie')) {
    headers.set('cookie', cookieHeader)
  }

  const authHeader = getHeader(event, 'authorization')
  if (authHeader && !headers.has('authorization')) {
    headers.set('authorization', authHeader)
  }

  return headers
}

function forwardSetCookieHeaders(event: H3Event, responseHeaders: Headers): void {
  const setCookieHeaders = responseHeaders.getSetCookie?.() ?? []

  if (setCookieHeaders.length > 0) {
    for (const value of setCookieHeaders) {
      appendResponseHeader(event, 'set-cookie', normalizeCookiePathForFrontend(value))
    }

    return
  }

  const singleCookie = responseHeaders.get('set-cookie')
  if (singleCookie) {
    appendResponseHeader(event, 'set-cookie', normalizeCookiePathForFrontend(singleCookie))
  }
}

const AUTH_COOKIE_PATH_REGEX = /([;\s]path=)\/auth(?=;|$)/i

function normalizeCookiePathForFrontend(cookieHeaderValue: string): string {
  return cookieHeaderValue.replace(AUTH_COOKIE_PATH_REGEX, '$1/api/auth')
}

export async function proxyBackendRequest<TResponse, TBody extends BodyInit | object | null = Record<string, unknown>>(
  event: H3Event,
  path: string,
  options: ProxyRequestOptions<TBody> = {},
): Promise<TResponse> {
  const config = useRuntimeConfig(event)

  try {
    const response = await $fetch.raw<TResponse>(path, {
      baseURL: config.backendApiBase,
      method: options.method,
      body: options.body,
      query: options.query,
      headers: buildProxyHeaders(event, options.headers),
    })

    setResponseStatus(event, response.status)
    forwardSetCookieHeaders(event, response.headers)

    return response._data as TResponse
  }
  catch (error) {
    normalizeBackendError(error)
  }
}
