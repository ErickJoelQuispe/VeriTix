import type { H3Event } from 'h3'
import type { CachedHandlerPolicy } from '../types'
import { getRouterParam } from 'h3'
import { hasAuthContext } from '../auth'

const PUBLIC_API_NAMESPACE = 'veritix:public-api'

function shouldCachePublicResponse<TResponse>(response: TResponse): boolean {
  return typeof response !== 'undefined'
}

function createAnonymousPublicPolicy<TResponse>(
  options: Omit<CachedHandlerPolicy<TResponse>, 'namespace' | 'shouldBypass' | 'shouldCache'>,
): CachedHandlerPolicy<TResponse> {
  return {
    namespace: PUBLIC_API_NAMESPACE,
    shouldBypass: hasAuthContext,
    shouldCache: shouldCachePublicResponse,
    ...options,
  }
}

export function createStaticPublicApiPolicy<TResponse>(options: {
  key: string
  maxAge: number
  staleMaxAge?: number
}): CachedHandlerPolicy<TResponse> {
  return createAnonymousPublicPolicy({
    getKey: () => options.key,
    maxAge: options.maxAge,
    staleMaxAge: options.staleMaxAge,
  })
}

export function createRouteParamPublicApiPolicy<TResponse>(options: {
  prefix: string
  param: string
  maxAge: number
  staleMaxAge?: number
}): CachedHandlerPolicy<TResponse> {
  return createAnonymousPublicPolicy({
    getKey: event => `${options.prefix}:${getRouterParam(event, options.param) ?? ''}`,
    maxAge: options.maxAge,
    staleMaxAge: options.staleMaxAge,
  })
}

export function createNormalizedQueryPublicApiPolicy<TResponse, TQuery extends Record<string, unknown>>(options: {
  prefix: string
  getNormalizedQuery: (event: H3Event) => TQuery
  maxAge: number
  staleMaxAge?: number
}): CachedHandlerPolicy<TResponse> {
  return createAnonymousPublicPolicy({
    getKey: event => `${options.prefix}:${JSON.stringify(options.getNormalizedQuery(event))}`,
    maxAge: options.maxAge,
    staleMaxAge: options.staleMaxAge,
  })
}
