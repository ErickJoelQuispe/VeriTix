export interface ApiErrorPayload {
  statusCode?: number
  message?: string | string[]
  error?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<TData> {
  data: TData[]
  meta: PaginationMeta
}
