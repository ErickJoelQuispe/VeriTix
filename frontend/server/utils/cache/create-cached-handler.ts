import type { H3Event } from 'h3'
import type { CachedHandlerPolicy, CacheStore } from './types'
import { defineEventHandler } from 'h3'
import { setNoStoreHeader, setPublicCacheHeaders } from './http'
import { publicApiMemoryCacheStore } from './stores/memory-store'

function getStorageKey<TResponse>(event: H3Event, policy: CachedHandlerPolicy<TResponse>): string {
  return `${policy.namespace}:${policy.getKey(event)}`
}

export function createCachedHandler<TResponse>(
  handler: (event: H3Event) => Promise<TResponse>,
  policy: CachedHandlerPolicy<TResponse>,
  store: CacheStore = publicApiMemoryCacheStore,
) {
  return defineEventHandler(async (event) => {
    if (policy.shouldBypass?.(event)) {
      setNoStoreHeader(event)
      return handler(event)
    }

    setPublicCacheHeaders(event, {
      maxAge: policy.maxAge,
      staleMaxAge: policy.staleMaxAge,
    })

    const storageKey = getStorageKey(event, policy)
    const cachedEntry = store.get<TResponse>(storageKey)

    if (cachedEntry) {
      return cachedEntry.value
    }

    const response = await handler(event)

    if (policy.shouldCache?.(response) ?? typeof response !== 'undefined') {
      store.set<TResponse>(storageKey, {
        expiresAt: Date.now() + policy.maxAge * 1000,
        value: response,
      })
    }

    return response
  })
}
