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

export function useAccessStatsStream(eventId: MaybeRefOrGetter<string>) {
  const config = useRuntimeConfig()
  const accessToken = useState<string | null>('auth-access-token', () => null)

  const snapshot = ref<AccessStatsSnapshot | null>(null)
  const status = ref<StreamStatus>('idle')
  const error = ref<string | null>(null)
  const updatesReceived = ref(0)

  let eventSource: EventSource | null = null

  function buildStreamUrl(id: string): string {
    const base = config.public.backendApiBase as string | undefined
      ?? config.public.apiBase as string

    const normalizedBase = base.replace(/\/$/, '')
    const token = accessToken.value ?? ''
    return `${normalizedBase}/events/${id}/access-stats/stream?token=${encodeURIComponent(token)}`
  }

  function connect(): void {
    const id = toValue(eventId)
    if (!id) return

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
        snapshot.value = JSON.parse(event.data) as AccessStatsSnapshot
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
