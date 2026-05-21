import type { BackofficeEventDetail } from '~~/shared/types'
import { useBackofficeEventsRepository } from '@/repositories/backofficeEventsRepository'

export function useEventDetail(eventId: MaybeRefOrGetter<string>) {
  const { getEvent } = useBackofficeEventsRepository()

  const event = ref<BackofficeEventDetail | null>(null)
  const isLoading = ref(false)

  async function fetch(): Promise<void> {
    isLoading.value = true
    try {
      const id = toValue(eventId)
      event.value = await getEvent(id)
    }
    catch {
      // Graceful silent failure per spec — event remains null
      event.value = null
    }
    finally {
      isLoading.value = false
    }
  }

  onMounted(() => void fetch())

  return {
    event,
    isLoading,
    fetch,
  }
}
