import type { PaginatedResponse } from '~~/shared/api/types'
import type { FavoriteItem } from '~~/shared/types'
import { useFavoritesRepository } from '@/repositories/favoritesRepository'
import { normalizeApiError } from '@/utils/apiError'

export function useMyFavorites() {
  const { listFavorites } = useFavoritesRepository()
  const { getApiErrorMessage, getApiErrorStatus, isApiSessionExpiredError } = useApiErrorMessage()

  const favorites = ref<FavoriteItem[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyFavorites(params: { page?: number, limit?: number } = {}): Promise<PaginatedResponse<FavoriteItem>> {
    isLoading.value = true
    error.value = null

    try {
      const response = await listFavorites(params)
      favorites.value = response.data
      total.value = response.meta.total
      return response
    }
    catch (err) {
      error.value = getApiErrorMessage(err, 'No pudimos cargar tus favoritos.')
      normalizeApiError(err, 'No pudimos cargar tus favoritos.', {
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
    favorites,
    total,
    isLoading,
    error,
    fetchMyFavorites,
  }
}
