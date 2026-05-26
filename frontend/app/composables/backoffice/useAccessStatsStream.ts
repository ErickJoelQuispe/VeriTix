export interface AccessStatsSnapshot {
  eventId: string
  capacity: number
  total: number
  validated: number
  pending: number
  denied: number
  percentage: number
  occupancy: number
  lastUpdated: string
}

type StreamStatus = 'idle' | 'connecting' | 'open' | 'error' | 'closed'

const TRAILING_SLASH_REGEX = /\/$/

export function useAccessStatsStream(eventId: MaybeRefOrGetter<string>) {
  const config = useRuntimeConfig()
  const accessToken = useState<string | null>('auth-access-token', () => null)

  const snapshot = ref<AccessStatsSnapshot | null>(null)
  const history = ref<AccessStatsSnapshot[]>([])
  const status = ref<StreamStatus>('idle')
  const error = ref<string | null>(null)
  const updatesReceived = ref(0)

  const MAX_HISTORY = 60

  let eventSource: EventSource | null = null

  function buildStreamUrl(id: string): string {
    const base = (config.public.apiBase as string).replace(TRAILING_SLASH_REGEX, '')
    const token = accessToken.value ?? ''
    return `${base}/admin/events/${id}/access-stats/stream?token=${encodeURIComponent(token)}`
  }

  function connect(): void {
    const id = toValue(eventId)
    if (!id) { return }

    disconnect()

    status.value = 'connecting'
    error.value = null

    const url = buildStreamUrl(id)
    eventSource = new EventSource(url)

    eventSource.onopen = () => {
      status.value = 'open'
    }

    eventSource.onmessage = (event: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(event.data) as AccessStatsSnapshot
        snapshot.value = parsed
        history.value = [...history.value.slice(-(MAX_HISTORY - 1)), parsed]
        updatesReceived.value++
      }
      catch {
        // malformed frame — ignore, keep connection alive
      }
    }

    eventSource.onerror = () => {
      // EventSource auto-reconnects on transient errors.
      // Only mark as error if the connection is definitively closed.
      if (eventSource?.readyState === EventSource.CLOSED) {
        status.value = 'error'
        error.value = 'La conexión con el servidor fue interrumpida.'
        eventSource = null
      }
    }
  }

  function disconnect(): void {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    status.value = 'closed'
  }

  const isConnected = computed(() => status.value === 'open')
  const isConnecting = computed(() => status.value === 'connecting')
  const hasError = computed(() => status.value === 'error')

  onMounted(() => connect())
  onUnmounted(() => disconnect())

  return {
    snapshot,
    history,
    status,
    error,
    updatesReceived,
    isConnected,
    isConnecting,
    hasError,
    connect,
    disconnect,
  }
}
