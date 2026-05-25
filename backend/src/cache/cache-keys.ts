// ── Cache key constants ───────────────────────────────────────────────────────
// Centralizadas aquí para evitar strings mágicos dispersos en el código.
// Cualquier cambio de naming se hace en un solo lugar.

export const CACHE_KEYS = {
  // Catálogos — TTL largo (1 hora)
  GENRES_LIST: 'genres:list',
  FORMATS_LIST: 'formats:list',
  VENUES_LIST: 'venues:list',
  VENUES_LIST_VERSION: 'venues:list:version',
  VENUES_LIST_QUERY: (version: number, params: Record<string, unknown>) =>
    `venues:list:v${version}:${JSON.stringify(params)}`,
  VENUES_DETAIL: (id: string) => `venues:${id}`,
  ARTISTS_LIST: 'artists:list',
  ARTISTS_LIST_VERSION: 'artists:list:version',
  ARTISTS_LIST_QUERY: (version: number, params: Record<string, unknown>) =>
    `artists:list:v${version}:${JSON.stringify(params)}`,
  ARTISTS_DETAIL: (id: string) => `artists:${id}`,

  // Eventos — TTL corto/medio
  EVENTS_LIST: (params: string) => `events:list:${params}`,
  EVENTS_DETAIL_STATIC: (id: string) => `events:static:${id}`,
  EVENTS_UPCOMING: (role: string, userId: string, limit: number) =>
    `events:upcoming:${role}:${userId}:${limit}`,
  EVENTS_TOP: (limit: number) => `events:top:${limit}`,
} as const;
