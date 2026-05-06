interface ApiErrorNormalizerDeps {
  getApiErrorStatus: (error: unknown) => number | undefined
  getApiErrorMessage: (error: unknown, fallback: string) => string
  isApiSessionExpiredError?: (error: unknown) => boolean
}

export function normalizeApiError(
  error: unknown,
  fallback: string,
  deps: ApiErrorNormalizerDeps,
): never {
  const normalizedError = createError({
    statusCode: deps.getApiErrorStatus(error) ?? 500,
    statusMessage: deps.getApiErrorMessage(error, fallback),
    data: error,
  })

  if (deps.isApiSessionExpiredError?.(error)) {
    ;(normalizedError as unknown as Record<string, unknown>).__sessionExpired = true
  }

  throw normalizedError
}
