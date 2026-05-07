export interface ApiErrorPayload {
  statusCode?: number
  message?: string | string[]
  error?: string
}

export interface PaginatedMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<TData> {
  data: TData[]
  meta: PaginatedMeta
}
