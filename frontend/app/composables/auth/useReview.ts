import type { PaginationMeta } from '~~/shared/api/types'
import type { Review } from '~~/shared/types'
import { z } from 'zod'
import { useReviewsRepository } from '@/repositories/reviewsRepository'
import { normalizeApiError } from '@/utils/apiError'

// ── Validation schema ─────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'La calificación mínima es 1').max(5, 'La calificación máxima es 5'),
  comment: z.string().min(1, 'El comentario no puede estar vacío').max(1000, 'El comentario no puede superar los 1000 caracteres'),
})

export type ReviewFormData = z.infer<typeof reviewSchema>

// ── Composable ────────────────────────────────────────────────────────────────

export function useReview(eventId: string) {
  const { createReview, updateReview, deleteReview, listPublicReviews } = useReviewsRepository()
  const { getApiErrorMessage, getApiErrorStatus, isApiSessionExpiredError } = useApiErrorMessage()
  const { user } = useAuth()

  const myReview = ref<Review | null>(null)
  const reviews = ref<Review[]>([])
  const publicMeta = ref<PaginationMeta | null>(null)
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetches public reviews for the event and extracts the current user's review.
   * Since there is no GET /reviews/mine endpoint, we load all reviews and filter
   * by userId client-side. For large review counts a higher limit is used.
   */
  async function fetchMyReview(): Promise<void> {
    if (!user.value?.id) { return }

    isLoading.value = true
    error.value = null

    try {
      const response = await listPublicReviews(eventId, 1, 100)
      const found = response.data.find(r => r.userId === user.value?.id) ?? null
      myReview.value = found
    }
    catch (err) {
      error.value = getApiErrorMessage(err, 'No pudimos cargar tu reseña.')
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Fetches the paginated public reviews for the event.
   */
  async function fetchPublicReviews(page = 1): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await listPublicReviews(eventId, page)
      reviews.value = response.data
      total.value = response.meta.total
      publicMeta.value = response.meta
    }
    catch (err) {
      error.value = getApiErrorMessage(err, 'No pudimos cargar las reseñas.')
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Submits a review: POST if none exists, PATCH if updating an existing one.
   * Validates the payload with Zod before sending.
   */
  async function submitReview(data: ReviewFormData): Promise<void> {
    reviewSchema.parse(data)

    isLoading.value = true
    error.value = null

    try {
      if (myReview.value) {
        myReview.value = await updateReview(myReview.value.id, {
          rating: data.rating,
          comment: data.comment,
        })
      }
      else {
        myReview.value = await createReview({
          eventId,
          rating: data.rating,
          comment: data.comment,
        })
      }
    }
    catch (err) {
      error.value = getApiErrorMessage(err, 'No pudimos guardar tu reseña.')
      normalizeApiError(err, 'No pudimos guardar tu reseña.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Deletes the current user's review.
   */
  async function removeReview(): Promise<void> {
    if (!myReview.value) { return }

    isLoading.value = true
    error.value = null

    try {
      await deleteReview(myReview.value.id)
      myReview.value = null
    }
    catch (err) {
      error.value = getApiErrorMessage(err, 'No pudimos eliminar tu reseña.')
      normalizeApiError(err, 'No pudimos eliminar tu reseña.', {
        getApiErrorStatus,
        getApiErrorMessage,
        isApiSessionExpiredError,
      })
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    myReview,
    reviews,
    publicMeta,
    total,
    isLoading,
    error,
    fetchMyReview,
    fetchPublicReviews,
    submitReview,
    removeReview,
  }
}
