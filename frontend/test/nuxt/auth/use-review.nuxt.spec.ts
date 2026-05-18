import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { z } from 'zod'

// Local copy of the schema for unit validation tests (mirrors useReview.ts)
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
})

// ── Fixtures ──────────────────────────────────────────────────────────────────

const reviewItem = {
  id: 'review-1',
  userId: 'user-1',
  eventId: 'event-1',
  rating: 4,
  comment: 'Great event!',
  createdAt: '2026-05-01T10:00:00Z',
  updatedAt: '2026-05-01T10:00:00Z',
  user: { name: 'Ana', lastName: 'Pérez' },
}

const paginatedEmpty = {
  data: [],
  meta: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
}

const paginatedWithReview = {
  data: [reviewItem],
  meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { apiRequestMock, useApiRequestMock } = vi.hoisted(() => {
  const apiRequestMock = vi.fn()
  return { apiRequestMock, useApiRequestMock: vi.fn(() => apiRequestMock) }
})

mockNuxtImport('useApiRequest', () => useApiRequestMock)

// Mock useAuth to provide a user ID for filtering own reviews
const { useAuthMock } = vi.hoisted(() => {
  return {
    useAuthMock: vi.fn(() => ({
      ensureSession: vi.fn().mockResolvedValue(true),
      isAuthenticated: { value: true },
      pending: { value: false },
      refreshStatus: { value: 'idle' },
      sessionStatus: { value: 'authenticated' },
      user: { value: { id: 'user-1', email: 'ana@example.com', role: 'BUYER' } },
    })),
  }
})
mockNuxtImport('useAuth', () => useAuthMock)

// ── Harness factory ───────────────────────────────────────────────────────────

function makeHarness(eventId: string) {
  return defineComponent({
    setup() {
      return useReview(eventId)
    },
    template: '<div />',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useReview — submitReview', () => {
  it('calls POST (create) when myReview is null', async () => {
    // fetchMyReview returns no existing review
    apiRequestMock.mockResolvedValueOnce(paginatedEmpty)
    // createReview call
    apiRequestMock.mockResolvedValueOnce(reviewItem)

    const wrapper = await mountSuspended(makeHarness('event-1'))
    await wrapper.vm.fetchMyReview()
    expect(wrapper.vm.myReview).toBeNull()

    await wrapper.vm.submitReview({ rating: 4, comment: 'Great event!' })

    // Should have called POST /reviews
    expect(apiRequestMock).toHaveBeenCalledWith(
      '/reviews',
      expect.objectContaining({
        method: 'POST',
        body: { eventId: 'event-1', rating: 4, comment: 'Great event!' },
      }),
    )
    expect(wrapper.vm.myReview).toEqual(reviewItem)
  })

  it('calls PATCH (update) when myReview already exists', async () => {
    // fetchMyReview returns an existing review (user-1 owns it)
    apiRequestMock.mockResolvedValueOnce(paginatedWithReview)
    // updateReview call
    const updatedReview = { ...reviewItem, rating: 5, comment: 'Even better!' }
    apiRequestMock.mockResolvedValueOnce(updatedReview)

    const wrapper = await mountSuspended(makeHarness('event-1'))
    await wrapper.vm.fetchMyReview()
    expect(wrapper.vm.myReview?.id).toBe('review-1')

    await wrapper.vm.submitReview({ rating: 5, comment: 'Even better!' })

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/reviews/review-1',
      expect.objectContaining({
        method: 'PATCH',
        body: { rating: 5, comment: 'Even better!' },
      }),
    )
    expect(wrapper.vm.myReview?.rating).toBe(5)
  })

  it('deletes review and clears myReview', async () => {
    apiRequestMock.mockResolvedValueOnce(paginatedWithReview)
    apiRequestMock.mockResolvedValueOnce(undefined) // DELETE response

    const wrapper = await mountSuspended(makeHarness('event-1'))
    await wrapper.vm.fetchMyReview()
    expect(wrapper.vm.myReview?.id).toBe('review-1')

    await wrapper.vm.removeReview()

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/reviews/review-1',
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(wrapper.vm.myReview).toBeNull()
  })
})

describe('useReview — Zod validation', () => {
  it('throws on rating = 0', () => {
    expect(() => reviewSchema.parse({ rating: 0, comment: 'valid comment' })).toThrow()
  })

  it('throws on rating = 6', () => {
    expect(() => reviewSchema.parse({ rating: 6, comment: 'valid comment' })).toThrow()
  })

  it('throws on empty comment', () => {
    expect(() => reviewSchema.parse({ rating: 3, comment: '' })).toThrow()
  })

  it('throws on comment exceeding 1000 characters', () => {
    expect(() => reviewSchema.parse({ rating: 3, comment: 'a'.repeat(1001) })).toThrow()
  })

  it('passes for valid rating 1-5 and comment 1-1000 chars', () => {
    expect(() => reviewSchema.parse({ rating: 5, comment: 'Perfect!' })).not.toThrow()
    expect(() => reviewSchema.parse({ rating: 1, comment: 'x'.repeat(1000) })).not.toThrow()
  })
})
