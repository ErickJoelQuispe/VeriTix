import type { CacheEntry, CacheStats, CacheStore } from '../types'

interface MemoryCacheStoreOptions {
  maxEntries: number
}

export class MemoryCacheStore implements CacheStore {
  private readonly cache = new Map<string, CacheEntry<unknown>>()

  constructor(private readonly options: MemoryCacheStoreOptions) {}

  get<TValue>(key: string): CacheEntry<TValue> | undefined {
    const entry = this.cache.get(key) as CacheEntry<TValue> | undefined

    if (!entry) {
      return undefined
    }

    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key)
      return undefined
    }

    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry
  }

  set<TValue>(key: string, entry: CacheEntry<TValue>): void {
    this.deleteExpired()

    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    this.cache.set(key, entry as CacheEntry<unknown>)
    this.evictIfNeeded()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  deleteExpired(): void {
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key)
      }
    }
  }

  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxEntries: this.options.maxEntries,
    }
  }

  private evictIfNeeded(): void {
    while (this.cache.size > this.options.maxEntries) {
      const oldestKey = this.cache.keys().next().value

      if (!oldestKey) {
        return
      }

      this.cache.delete(oldestKey)
    }
  }
}

export const publicApiMemoryCacheStore = new MemoryCacheStore({
  maxEntries: 500,
})
