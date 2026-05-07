import type {
  AdminArtistPayload,
  AdminArtistRecord,
  GenreOption,
  PaginatedResponse,
} from '~/types'

export function useAdminArtistsRepository() {
  const apiRequest = useApiRequest()
  const { requireAdminHeaders } = useAdminApi()

  async function listGenres(): Promise<GenreOption[]> {
    return apiRequest<GenreOption[]>('/genres', {
      method: 'GET',
    })
  }

  async function listArtists({
    pageValue,
    pageSize,
    search,
    genreId,
    isActive,
  }: {
    pageValue: number
    pageSize: number
    search: string
    genreId: string
    isActive: string
  }): Promise<PaginatedResponse<AdminArtistRecord>> {
    return apiRequest<PaginatedResponse<AdminArtistRecord>>('/admin/artists', {
      method: 'GET',
      headers: requireAdminHeaders(),
      query: {
        page: pageValue,
        limit: pageSize,
        search: search.trim() || undefined,
        genreId: genreId || undefined,
        isActive: isActive || undefined,
      },
    })
  }

  async function getArtist(artistId: string): Promise<AdminArtistRecord> {
    return apiRequest<AdminArtistRecord>(`/admin/artists/${artistId}`, {
      method: 'GET',
      headers: requireAdminHeaders(),
    })
  }

  async function createArtist(payload: AdminArtistPayload): Promise<AdminArtistRecord> {
    return apiRequest<AdminArtistRecord, AdminArtistPayload>('/admin/artists', {
      method: 'POST',
      headers: requireAdminHeaders(),
      body: payload,
    })
  }

  async function updateArtist(artistId: string, payload: AdminArtistPayload): Promise<AdminArtistRecord> {
    return apiRequest<AdminArtistRecord, AdminArtistPayload>(`/admin/artists/${artistId}`, {
      method: 'PATCH',
      headers: requireAdminHeaders(),
      body: payload,
    })
  }

  async function deleteArtist(artistId: string): Promise<void> {
    await apiRequest(`/admin/artists/${artistId}`, {
      method: 'DELETE',
      headers: requireAdminHeaders(),
    })
  }

  return {
    listGenres,
    listArtists,
    getArtist,
    createArtist,
    updateArtist,
    deleteArtist,
  }
}
