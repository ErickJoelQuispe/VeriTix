import type { H3Event } from 'h3'
import { setResponseHeader } from 'h3'

export interface PublicCacheHeaderOptions {
  maxAge: number
  staleMaxAge?: number
}

export function setPublicCacheHeaders(event: H3Event, options: PublicCacheHeaderOptions): void {
  const directives = [`public`, `s-maxage=${options.maxAge}`]

  if (options.staleMaxAge && options.staleMaxAge > 0) {
    directives.push(`stale-while-revalidate=${options.staleMaxAge}`)
  }

  setResponseHeader(event, 'cache-control', directives.join(', '))
}

export function setNoStoreHeader(event: H3Event): void {
  setResponseHeader(event, 'cache-control', 'no-store')
}
