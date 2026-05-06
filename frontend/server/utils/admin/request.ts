import type { H3Event } from 'h3'
import { createError, getQuery, getRouterParam, readBody } from 'h3'

type QueryRecord = Record<string, string | number | boolean | undefined>

function asSingleValue(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return value[0]?.toString().trim()
  }

  if (typeof value === 'undefined' || value === null) {
    return undefined
  }

  return value.toString().trim()
}

function parseInteger(value: string | undefined, fallback: number, options: { min: number, max: number }): number {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed) || parsed < options.min || parsed > options.max) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid numeric value "${value}"`,
    })
  }

  return parsed
}

export function readOptionalStringQuery(event: H3Event, key: string): string | undefined {
  const value = asSingleValue(getQuery(event)[key])
  return value && value.length > 0 ? value : undefined
}

export function readPageQuery(event: H3Event, fallback = 1): number {
  return parseInteger(readOptionalStringQuery(event, 'page'), fallback, { min: 1, max: 10_000 })
}

export function readLimitQuery(event: H3Event, fallback: number, max = 200): number {
  return parseInteger(readOptionalStringQuery(event, 'limit'), fallback, { min: 1, max })
}

export function readBooleanQuery(event: H3Event, key: string): boolean | undefined {
  const value = readOptionalStringQuery(event, key)

  if (typeof value === 'undefined') {
    return undefined
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

export async function readRequiredBodyObject<TBody extends Record<string, unknown>>(event: H3Event): Promise<TBody> {
  const body = await readBody<TBody | null>(event)

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body',
    })
  }

  return body
}

export function withDefinedQuery(query: QueryRecord): QueryRecord {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => typeof value !== 'undefined'))
}
