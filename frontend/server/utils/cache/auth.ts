import type { H3Event } from 'h3'
import { getHeader } from 'h3'

const AUTH_COOKIE_NAMES = new Set([
  'refresh_token',
  'access_token',
  'auth_token',
  'session',
  'session_id',
])

function hasAuthCookie(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) {
    return false
  }

  const cookies = cookieHeader
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)

  for (const part of cookies) {
    const separator = part.indexOf('=')
    const cookieName = separator > 0 ? part.slice(0, separator).trim() : part

    if (AUTH_COOKIE_NAMES.has(cookieName)) {
      return true
    }
  }

  return false
}

export function hasAuthContext(event: H3Event): boolean {
  return Boolean(getHeader(event, 'authorization')) || hasAuthCookie(getHeader(event, 'cookie'))
}
