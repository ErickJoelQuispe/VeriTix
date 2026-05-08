import type { H3Event } from 'h3'
import { createError, getQuery, getRouterParam, readBody } from 'h3'
import { compactQuery, normalizeQueryValue } from '~~/shared/query'

function readSingleQueryValue(event: H3Event, key: string): string | number | boolean | undefined {
  return normalizeQueryValue(getQuery(event)[key])
}

export function readOptionalStringQuery(event: H3Event, key: string): string | undefined {
  const value = readSingleQueryValue(event, key)
  return typeof value === 'string' ? value : undefined
}

export function readPageQuery(event: H3Event, fallback = 1): number {
  const value = readSingleQueryValue(event, 'page')

  if (typeof value === 'undefined') {
    return fallback
  }

  const parsed = Number.parseInt(String(value), 10)

  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10_000) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid numeric value "${value}"`,
    })
  }

  return parsed
}

export function readLimitQuery(event: H3Event, fallback: number, max = 200): number {
  const value = readSingleQueryValue(event, 'limit')

  if (typeof value === 'undefined') {
    return fallback
  }

  const parsed = Number.parseInt(String(value), 10)

  if (!Number.isFinite(parsed) || parsed < 1 || parsed > max) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid numeric value "${value}"`,
    })
  }

  return parsed
}

export function readBooleanQuery(event: H3Event, key: string): boolean | undefined {
  const value = readSingleQueryValue(event, key)

  if (typeof value === 'undefined') {
    return undefined
  }

  if (value === true || value === false) {
    return value
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  throw createError({
    statusCode: 400,
    statusMessage: `Invalid boolean value for "${key}"`,
  })
}

export function requireRouteId(event: H3Event, entityName: string): string {
  const id = getRouterParam(event, 'id')?.trim()

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing ${entityName} id`,
    })
  }

  return id
}

export async function readRequiredBodyObject<TBody extends object>(event: H3Event): Promise<TBody> {
  const body = await readBody<TBody | null>(event)

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body',
    })
  }

  return body
}

export function withDefinedQuery(query: Record<string, string | number | boolean | null | undefined>): Record<string, string | number | boolean> {
  return compactQuery(query)
}
