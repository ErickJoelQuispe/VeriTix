import type { PaginatedResponse } from '~~/shared/api/types'
import type { Review, ReviewPayload } from '~~/shared/types'
import { compactQuery } from '~~/shared/query'

export function useReviewsRepository() {
  const apiRequest = useApiRequest()

  /**
   * POST /reviews
   * Creates a review for an event. Requires BUYER role with at least one USED ticket.
   */
  async function createReview(payload: ReviewPayload): Promise<Review> {
    return apiRequest<Review, ReviewPayload>('/reviews', {
      method: 'POST',
      body: payload,
    })
  }

  /**
   * PATCH /reviews/:id
   * Updates an existing review. Only the author may update.
   */
  async function updateReview(id: string, payload: Partial<Pick<ReviewPayload, 'rating' | 'comment'>>): Promise<Review> {
    return apiRequest<Review, Partial<Pick<ReviewPayload, 'rating' | 'comment'>>>(`/reviews/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  /**
   * DELETE /reviews/:id
   * Deletes a review. Author or ADMIN may delete.
   */
  async function deleteReview(id: string): Promise<void> {
    await apiRequest(`/reviews/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * GET /events/:eventId/reviews?page=&limit=
   * Returns a paginated list of public reviews for an event.
   */
  async function listPublicReviews(eventId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
    return apiRequest<PaginatedResponse<Review>>(`/events/${eventId}/reviews`, {
      method: 'GET',
      query: compactQuery({ page, limit }),
    })
  }

  return {
    createReview,
    updateReview,
    deleteReview,
    listPublicReviews,
  }
}
