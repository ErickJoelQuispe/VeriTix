import type { PaginatedResponse } from '~~/shared/api/types'
import type {
  BackofficeArtistPayload,
  BackofficeArtistRecord,
  GenreOption,
} from '~~/shared/types'
import { compactQuery } from '~~/shared/query'

export function useBackofficeArtistsRepository() {
  const apiRequest = useApiRequest()

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
  }): Promise<PaginatedResponse<BackofficeArtistRecord>> {
    return apiRequest<PaginatedResponse<BackofficeArtistRecord>>(
      '/admin/artists',
      {
        method: 'GET',
        query: compactQuery({
          page: pageValue,
          limit: pageSize,
          search,
          genreId,
          isActive,
        }),
      },
    )
  }

  async function getArtist(artistId: string): Promise<BackofficeArtistRecord> {
    return apiRequest<BackofficeArtistRecord>(`/admin/artists/${artistId}`, {
      method: 'GET',
    })
  }

  async function createArtist(
    payload: BackofficeArtistPayload,
  ): Promise<BackofficeArtistRecord> {
    return apiRequest<BackofficeArtistRecord, BackofficeArtistPayload>(
      '/admin/artists',
      {
        method: 'POST',
        body: payload,
      },
    )
  }

  async function updateArtist(
    artistId: string,
    payload: BackofficeArtistPayload,
  ): Promise<BackofficeArtistRecord> {
    return apiRequest<BackofficeArtistRecord, BackofficeArtistPayload>(
      `/admin/artists/${artistId}`,
      {
        method: 'PATCH',
        body: payload,
      },
    )
  }

  async function deleteArtist(artistId: string): Promise<void> {
    await apiRequest(`/admin/artists/${artistId}`, {
      method: 'DELETE',
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
