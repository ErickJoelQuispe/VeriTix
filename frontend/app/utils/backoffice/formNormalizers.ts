export function normalizeRequiredString(value: string | null | undefined): string {
  return (value ?? '').trim()
}

export function normalizeOptionalString(value: string | null | undefined): string | undefined {
  const normalized = normalizeRequiredString(value)

  return normalized || undefined
}

export function normalizeOptionalIsoDateTime(value: string | null | undefined): string | undefined {
  const normalized = normalizeOptionalString(value)

  if (!normalized) {
    return undefined
  }

  const date = new Date(normalized)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

export function normalizeRequiredIsoDateTime(value: string | null | undefined): string {
  return normalizeOptionalIsoDateTime(value) ?? ''
}

export function normalizeStringArray(values?: Array<string | null | undefined>): string[] | undefined {
  if (!values?.length) {
    return undefined
  }

  const normalizedValues = values
    .map(value => normalizeOptionalString(value))
    .filter((value): value is string => Boolean(value))

  if (!normalizedValues.length) {
    return undefined
  }

  return [...new Set(normalizedValues)].sort()
}

export function areStringArraysEqual(left?: string[], right?: string[]): boolean {
  if (!left?.length && !right?.length) {
    return true
  }

  if (!left || !right || left.length !== right.length) {
    return false
  }

  return left.every((value, index) => value === right[index])
}
