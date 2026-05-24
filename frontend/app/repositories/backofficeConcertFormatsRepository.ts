import type {
  BackofficeConcertFormatPayload,
  BackofficeFormatRecord,
} from '~~/shared/types'

export function useBackofficeConcertFormatsRepository() {
  const apiRequest = useApiRequest()

  async function listConcertFormats(): Promise<BackofficeFormatRecord[]> {
    return apiRequest<BackofficeFormatRecord[]>('/admin/concert-formats', {
      method: 'GET',
    })
  }

  async function getConcertFormat(formatId: string): Promise<BackofficeFormatRecord> {
    return apiRequest<BackofficeFormatRecord>(`/admin/concert-formats/${formatId}`, {
      method: 'GET',
    })
  }

  async function createConcertFormat(payload: BackofficeConcertFormatPayload): Promise<BackofficeFormatRecord> {
    return apiRequest<BackofficeFormatRecord, BackofficeConcertFormatPayload>('/admin/concert-formats', {
      method: 'POST',
      body: payload,
    })
  }

  async function updateConcertFormat(formatId: string, payload: BackofficeConcertFormatPayload): Promise<BackofficeFormatRecord> {
    return apiRequest<BackofficeFormatRecord, BackofficeConcertFormatPayload>(`/admin/concert-formats/${formatId}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  async function deleteConcertFormat(formatId: string): Promise<void> {
    await apiRequest(`/admin/concert-formats/${formatId}`, {
      method: 'DELETE',
    })
  }

  return {
    listConcertFormats,
    getConcertFormat,
    createConcertFormat,
    updateConcertFormat,
    deleteConcertFormat,
  }
}
