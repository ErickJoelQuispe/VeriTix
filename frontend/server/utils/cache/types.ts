import type { H3Event } from 'h3'

export interface CacheEntry<TValue> {
  expiresAt: number
  value: TValue
}

export interface CacheStats {
  size: number
  maxEntries: number
}

export interface CacheStore {
  get: <TValue>(key: string) => CacheEntry<TValue> | undefined
  set: <TValue>(key: string, entry: CacheEntry<TValue>) => void
  delete: (key: string) => void
  deleteExpired: () => void
  getStats: () => CacheStats
}

export interface CachedHandlerPolicy<TResponse> {
  namespace: string
  getKey: (event: H3Event) => string
  maxAge: number
  staleMaxAge?: number
  shouldBypass?: (event: H3Event) => boolean
  shouldCache?: (response: TResponse) => boolean
}
