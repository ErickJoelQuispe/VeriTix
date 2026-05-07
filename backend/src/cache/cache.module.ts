import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
import { CacheService } from './cache.service';

// ── TTL constants (en milisegundos) ───────────────────────────────────────────

/** 2 minutos — listado de eventos, analytics */
export const CACHE_TTL_SHORT = 2 * 60 * 1000;

/** 5 minutos — detalle estático de evento */
export const CACHE_TTL_MEDIUM = 5 * 60 * 1000;

/** 1 hora — catálogos (géneros, venues, artistas, formatos) */
export const CACHE_TTL_LONG = 60 * 60 * 1000;

// ── Module ────────────────────────────────────────────────────────────────────

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const password = config.get<string>('REDIS_PASSWORD');
        const host = config.get<string>('REDIS_HOST', 'redis');
        const port = config.get<number>('REDIS_PORT', 6379);

        // redis://:password@host:port
        const url = `redis://:${password}@${host}:${port}`;

        return {
          stores: [
            createKeyv(url, {
              // No lanzar error si Redis no está disponible
              // La app sigue funcionando yendo directo a la DB
              throwOnConnectError: false,
            }),
          ],
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class AppCacheModule {}
