import type { PaginatedResponse } from '~~/shared/api/types'
import type {
  BackofficeVenueListQuery,
  BackofficeVenuePayload,
  BackofficeVenueRecord,
} from '~~/shared/types'
import { compactQuery } from '~~/shared/query'

export function useBackofficeVenuesRepository() {
  const apiRequest = useApiRequest()

  async function listVenues(
    query: BackofficeVenueListQuery,
  ): Promise<PaginatedResponse<BackofficeVenueRecord>> {
    return apiRequest<PaginatedResponse<BackofficeVenueRecord>>(
      '/admin/venues',
      {
        method: 'GET',
        query: compactQuery({
          page: query.pageValue,
          limit: query.pageSize,
          search: query.search,
          city: query.city,
          isActive: query.isActive,
        }),
      },
    )
  }

  async function getVenue(venueId: string): Promise<BackofficeVenueRecord> {
    return apiRequest<BackofficeVenueRecord>(`/admin/venues/${venueId}`, {
      method: 'GET',
    })
  }

  async function createVenue(
    payload: BackofficeVenuePayload,
  ): Promise<BackofficeVenueRecord> {
    return apiRequest<BackofficeVenueRecord, BackofficeVenuePayload>(
      '/admin/venues',
      {
        method: 'POST',
        body: payload,
      },
    )
  }

  async function updateVenue(
    venueId: string,
    payload: BackofficeVenuePayload,
  ): Promise<BackofficeVenueRecord> {
    return apiRequest<BackofficeVenueRecord, BackofficeVenuePayload>(
      `/admin/venues/${venueId}`,
      {
        method: 'PATCH',
        body: payload,
      },
    )
  }

  async function deleteVenue(venueId: string): Promise<void> {
    await apiRequest(`/admin/venues/${venueId}`, {
      method: 'DELETE',
    })
  }

  return {
    listVenues,
    getVenue,
    createVenue,
    updateVenue,
    deleteVenue,
  }
}
