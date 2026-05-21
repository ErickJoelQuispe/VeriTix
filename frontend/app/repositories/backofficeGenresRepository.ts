import type {
  BackofficeGenrePayload,
  BackofficeGenreRecord,
} from '~~/shared/types'

export function useBackofficeGenresRepository() {
  const apiRequest = useApiRequest()

  async function listGenres(): Promise<BackofficeGenreRecord[]> {
    return apiRequest<BackofficeGenreRecord[]>('/admin/genres', {
      method: 'GET',
    })
  }

  async function getGenre(genreId: string): Promise<BackofficeGenreRecord> {
    return apiRequest<BackofficeGenreRecord>(`/admin/genres/${genreId}`, {
      method: 'GET',
    })
  }

  async function createGenre(payload: BackofficeGenrePayload): Promise<BackofficeGenreRecord> {
    return apiRequest<BackofficeGenreRecord, BackofficeGenrePayload>('/admin/genres', {
      method: 'POST',
      body: payload,
    })
  }

  async function updateGenre(genreId: string, payload: BackofficeGenrePayload): Promise<BackofficeGenreRecord> {
    return apiRequest<BackofficeGenreRecord, BackofficeGenrePayload>(`/admin/genres/${genreId}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  async function deleteGenre(genreId: string): Promise<void> {
    await apiRequest(`/admin/genres/${genreId}`, {
      method: 'DELETE',
    })
  }

  return {
    listGenres,
    getGenre,
    createGenre,
    updateGenre,
    deleteGenre,
  }
}
