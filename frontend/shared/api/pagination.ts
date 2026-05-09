import type { PaginatedResponse as ApiPaginatedResponse, PaginationMeta } from './types'

export function toUiPaginationMeta(meta: PaginationMeta): PaginationMeta {
  return meta
}

export function toUiPaginatedResponse<T>(response: ApiPaginatedResponse<T>): ApiPaginatedResponse<T> {
  return {
    data: response.data,
    meta: toUiPaginationMeta(response.meta),
  }
}
