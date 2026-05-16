import { useFavoritesRepository } from '@/repositories/favoritesRepository'

export function useFavorite(eventId: string) {
  const { toggleFavorite, getFavoriteStatus } = useFavoritesRepository()
  const { getApiErrorMessage } = useApiErrorMessage()

  const isFavorited = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetches the current favorite status from the API and updates local state.
   */
  async function checkFavorite(): Promise<void> {
    isLoading.value = true

    try {
      const status = await getFavoriteStatus(eventId)
      isFavorited.value = status.isFavorite
    }
    catch {
      // Silent fail on check — state remains false (safe default)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Optimistically toggles the favorite state:
   * 1. Flip local ref immediately
   * 2. Call the API
   * 3. On error: revert to prior state and surface the error via toast
   */
  async function toggle(): Promise<void> {
    if (isLoading.value) return

    const previous = isFavorited.value
    isFavorited.value = !previous
    isLoading.value = true

    try {
      const status = await toggleFavorite(eventId)
      isFavorited.value = status.isFavorite
    }
    catch (err) {
      isFavorited.value = previous
      error.value = getApiErrorMessage(err, 'No pudimos actualizar el favorito.')
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    isFavorited,
    isLoading,
    error,
    checkFavorite,
    toggle,
  }
}
