import type { ApiErrorPayload } from '~~/shared/types'

interface FetchLikeError {
  name?: string
  message?: string
  statusCode?: number
  response?: {
    status?: number
  }
  data?: ApiErrorPayload
  __sessionExpired?: boolean
}

export function useApiErrorMessage() {
  function isApiTimeoutError(error: unknown): boolean {
    const fetchError = error as FetchLikeError
    const message = (fetchError.message || '').toLowerCase()

    return fetchError.name === 'AbortError' || message.includes('timeout')
  }

  function getApiErrorStatus(error: unknown): number | undefined {
    const fetchError = error as FetchLikeError
    return fetchError.response?.status ?? fetchError.statusCode ?? fetchError.data?.statusCode
  }

  function isApiAuthError(error: unknown): boolean {
    const status = getApiErrorStatus(error)
    return status === 401 || status === 403
  }

  function isApiSessionExpiredError(error: unknown): boolean {
    return Boolean((error as FetchLikeError).__sessionExpired)
  }

  function markApiSessionExpiredError(error: unknown): unknown {
    if (error && typeof error === 'object') {
      ;(error as FetchLikeError).__sessionExpired = true
    }

    return error
  }

  function getApiErrorMessage(error: unknown, fallback: string): string {
    const fetchError = error as FetchLikeError
    const payload = fetchError.data

    if (isApiTimeoutError(error)) {
      return 'La conexión tardó demasiado. Reintentá en unos segundos.'
    }

    if (Array.isArray(payload?.message)) {
      return payload.message.join(', ')
    }

    if (typeof payload?.message === 'string' && payload.message.length > 0) {
      return payload.message
    }

    if (payload?.error) {
      return payload.error
    }

    if (fetchError.message) {
      return fetchError.message
    }

    return fallback
  }

  return {
    getApiErrorStatus,
    getApiErrorMessage,
    isApiAuthError,
    isApiTimeoutError,
    isApiSessionExpiredError,
    markApiSessionExpiredError,
  }
}
