import type { H3Event } from 'h3'
import { getHeader } from 'h3'

export function hasAuthContext(event: H3Event): boolean {
  return Boolean(getHeader(event, 'authorization') || getHeader(event, 'cookie'))
}
