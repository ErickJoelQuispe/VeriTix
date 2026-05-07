import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (err: any) {
      this.logger.warn(`Cache get failed for key "${key}": ${err.message}`);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (err: any) {
      this.logger.warn(`Cache set failed for key "${key}": ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (err: any) {
      this.logger.warn(`Cache del failed for key "${key}": ${err.message}`);
    }
  }

  /**
   * Get-or-set pattern: intenta leer del caché y si no existe ejecuta fn()
   * para obtener el valor, lo guarda y lo retorna.
   *
   * Si Redis falla silenciosamente en cualquier punto, siempre ejecuta fn()
   * y devuelve el resultado fresco de la DB.
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined && cached !== null) return cached;

    const value = await fn();
    await this.set(key, value, ttl);
    return value;
  }
}
