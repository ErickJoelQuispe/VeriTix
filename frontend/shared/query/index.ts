export type QueryValue = string | number | boolean | null | undefined

export function trimToUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()

  return trimmed && trimmed.length > 0 ? trimmed : undefined
}

export function normalizeQueryValue(value: unknown): string | number | boolean | undefined {
  if (Array.isArray(value)) {
    return normalizeQueryValue(value[0])
  }

  if (typeof value === 'string') {
    return trimToUndefined(value)
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  return undefined
}

export function compactQuery<T extends Record<string, QueryValue>>(query: T): Record<string, string | number | boolean> {
  const compacted: Record<string, string | number | boolean> = {}

  for (const [key, value] of Object.entries(query)) {
    const normalized = normalizeQueryValue(value)

    if (typeof normalized !== 'undefined') {
      compacted[key] = normalized
    }
  }

  return compacted
}
