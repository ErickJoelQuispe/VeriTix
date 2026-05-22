<script setup lang="ts">
import type { TicketType } from '~~/shared/types/domain'
import { useTicketTypesRepository } from '@/repositories/ticketTypesRepository'
import { formatEventDate } from '@/utils/date-formatters'

const route = useRoute()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()
const { isAuthenticated, user } = useAuth()
const { add: addToast } = useToastQueue()

const roleLabels: Record<string, string> = {
  HEADLINER: 'Cabeza de cartel',
  SPECIAL_GUEST: 'Invitado especial',
  OPENER: 'Apertura',
}

const eventId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

const { data: event, status, error, refresh: refreshEvent } = await usePublicEvent(eventId)
const { data: lineup, status: lineupStatus, error: lineupError, refresh: refreshLineup } = await usePublicEventArtists(eventId)

const ticketTypes = ref<TicketType[]>([])
const loadingTicketTypes = ref(false)
const ticketTypesError = ref('')

async function loadTicketTypes() {
  if (!eventId.value) {
    return
  }

  loadingTicketTypes.value = true
  ticketTypesError.value = ''

  try {
    ticketTypes.value = await useTicketTypesRepository().listByEvent(eventId.value)
  }
  catch {
    ticketTypesError.value = 'No pudimos cargar los tipos de entrada en este momento.'
  }
  finally {
    loadingTicketTypes.value = false
  }
}

onMounted(loadTicketTypes)

const selection = ref<Array<{ ticketTypeId: string, quantity: number, unitPrice: number }>>([])
const buyLoading = ref(false)

const canBuy = computed(() => selection.value.some(item => item.quantity > 0))
const hasTicketTypes = computed(() => ticketTypes.value.length > 0)
const isPurchasable = computed(() => event.value?.status === 'PUBLISHED')
const selectedTicketsCount = computed(() => selection.value.reduce((sum, item) => sum + item.quantity, 0))
const checkoutCtaText = computed(() => {
  if (buyLoading.value) {
    return 'Redirigiendo al checkout...'
  }

  if (!isPurchasable.value) {
    return 'Venta no disponible'
  }

  if (!canBuy.value) {
    return 'Elegí tus entradas para continuar'
  }

  return selectedTicketsCount.value === 1
    ? 'Continuar con 1 entrada'
    : `Continuar con ${selectedTicketsCount.value} entradas`
})

const eventStatusLabels: Record<string, string> = {
  PUBLISHED: 'Disponible',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
  DRAFT: 'Borrador',
}

const eventStatusTone: Record<string, 'success' | 'neutral' | 'error' | 'warning'> = {
  PUBLISHED: 'success',
  FINISHED: 'neutral',
  CANCELLED: 'error',
  DRAFT: 'warning',
}

function handleSelectionUpdate(items: Array<{ ticketTypeId: string, quantity: number, unitPrice: number }>) {
  selection.value = items
}

async function handleBuy() {
  if (!canBuy.value || buyLoading.value || !isPurchasable.value) {
    return
  }

  if (!isAuthenticated.value) {
    await navigateTo(`/login?redirect=/events/${eventId.value}`)
    return
  }

  buyLoading.value = true
  try {
    const { createOrder } = useMyOrders()
    const order = await createOrder({
      eventId: eventId.value,
      items: selection.value.map(item => ({
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
      })),
    })
    await navigateTo(order.checkoutUrl, { external: true })
  }
  catch (err: unknown) {
    const { getApiErrorMessage: getMsg } = useApiErrorMessage()
    const message = getMsg(err, 'No pudimos procesar tu compra. Intentá de nuevo.')
    addToast({ title: 'Error al comprar', description: message, color: 'error' })
  }
  finally {
    buyLoading.value = false
  }
}

useSeoMeta({
  title: () => (event.value ? `${event.value.name} | VeriTix` : 'Evento | VeriTix'),
  description: () => event.value?.description ?? 'Detalle del evento en VeriTix.',
})

const eventDate = computed(() => (event.value ? formatEventDate(event.value.dateISO) : ''))

const eventLocation = computed(() => {
  if (!event.value) {
    return ''
  }

  return [event.value.venue.name, event.value.venue.city, event.value.venue.country]
    .filter(Boolean)
    .join(' · ')
})

const doorsOpen = computed(() => (event.value?.doorsOpenISO ? formatEventDate(event.value.doorsOpenISO) : 'Por confirmar'))
const startSale = computed(() => (event.value?.startSaleISO ? formatEventDate(event.value.startSaleISO) : 'Por confirmar'))
const endSale = computed(() => (event.value?.endSaleISO ? formatEventDate(event.value.endSaleISO) : 'Por confirmar'))
const genreLabels = computed(() => event.value?.genres.map(genre => genre.name).join(' · ') ?? '')
const eventStatusLabel = computed(() => (event.value ? (eventStatusLabels[event.value.status] ?? event.value.status) : ''))
const eventStatusColor = computed(() => (event.value ? (eventStatusTone[event.value.status] ?? 'neutral') : 'neutral'))

const eventErrorStatus = computed(() => (error.value ? getApiErrorStatus(error.value) : undefined))

const eventErrorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  if (eventErrorStatus.value === 404) {
    return 'No encontramos este evento o ya no está disponible.'
  }

  return getApiErrorMessage(error.value, 'No pudimos cargar el evento en este momento.')
})

const lineupItems = computed(() => lineup.value ?? [])
const lineupGroups = computed(() => {
  const groups: Array<{
    key: string
    title: string
    subtitle: string
    items: typeof lineupItems.value
  }> = []

  const headliners = lineupItems.value.filter(item => item.role === 'HEADLINER')
  const guests = lineupItems.value.filter(item => item.role === 'SPECIAL_GUEST')
  const openers = lineupItems.value.filter(item => item.role === 'OPENER')
  const others = lineupItems.value.filter(item => !['HEADLINER', 'SPECIAL_GUEST', 'OPENER'].includes(item.role))

  if (headliners.length) {
    groups.push({
      key: 'headliners',
      title: 'Headliners',
      subtitle: 'Artistas principales',
      items: headliners,
    })
  }

  if (guests.length) {
    groups.push({
      key: 'special-guests',
      title: 'Invitados especiales',
      subtitle: 'Actos destacados',
      items: guests,
    })
  }

  if (openers.length) {
    groups.push({
      key: 'openers',
      title: 'Apertura',
      subtitle: 'Inicio del show',
      items: openers,
    })
  }

  if (others.length) {
    groups.push({
      key: 'others',
      title: 'Otros artistas',
      subtitle: 'Participaciones adicionales',
      items: others,
    })
  }

  return groups
})
const lineupErrorMessage = computed(() => {
  if (!lineupError.value) {
    return ''
  }

  return getApiErrorMessage(lineupError.value, 'No pudimos cargar el lineup público en este momento.')
})

const WHITESPACE_RE = /\s+/

function artistInitials(name: string): string {
  return name
    .split(WHITESPACE_RE)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('') || 'A'
}

function formatPerformanceTime(value: string | Date | null): string {
  if (!value) {
    return 'Por confirmar'
  }

  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <BaseContainer>
      <div v-if="status === 'pending'" class="space-y-6">
        <BaseSpinner class="h-8 w-48 rounded-full" />
        <BaseSpinner class="h-96 rounded-3xl" />
        <BaseSpinner class="h-64 rounded-2xl" />
      </div>

      <div v-else-if="event" class="mx-auto w-full max-w-7xl space-y-10">
        <!-- Back link -->
        <NuxtLink
          to="/events"
          class="inline-flex items-center gap-2 text-sm text-toned transition-colors hover:text-highlighted"
        >
          <BaseIcon name="i-lucide-arrow-left" class="size-4" />
          Volver a eventos
        </NuxtLink>

        <!-- TOP ROW: HERO + TICKETS -->
        <div class="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(24rem,0.92fr)] lg:items-start">
          <!-- HERO -->
          <div class="space-y-4">
            <UiPanel
              as="section"
              variant="glass"
              radius="xl"
              padding="none"
              class="relative overflow-hidden"
            >
              <NuxtImg
                v-if="event.imageUrl"
                :src="event.imageUrl"
                :alt="`Imagen de ${event.name}`"
                class="min-h-96 w-full object-cover lg:min-h-140"
                width="1200"
                height="900"
                sizes="100vw lg:66vw"
                placeholder
              />

              <div v-else class="flex min-h-96 items-center justify-center px-8 py-16 text-center lg:min-h-140">
                <div class="max-w-sm space-y-4">
                  <BaseIcon name="i-lucide-image-off" class="mx-auto size-10 text-muted" />
                  <div class="space-y-2">
                    <p class="text-lg font-semibold text-highlighted">
                      Sin imagen pública
                    </p>
                    <p class="text-sm leading-relaxed text-toned">
                      Este evento no tiene una imagen cargada en el backend todavía.
                    </p>
                  </div>
                </div>
              </div>
            </UiPanel>

            <div class="space-y-3 px-1 sm:px-2">
              <div class="flex flex-wrap gap-2">
                <BaseBadge v-for="genre in event.genres" :key="genre.id" kind="tag" size="xs">
                  {{ genre.name }}
                </BaseBadge>
                <BaseBadge kind="status" size="xs" :color="eventStatusColor">
                  {{ eventStatusLabel }}
                </BaseBadge>
                <BaseBadge kind="price" size="xs" color="primary">
                  {{ event.currency }}
                </BaseBadge>
              </div>

              <h1 class="font-display text-3xl leading-tight text-highlighted sm:text-4xl lg:text-5xl">
                {{ event.name }}
              </h1>

              <p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-toned sm:text-base">
                <span class="inline-flex items-center gap-1.5">
                  <BaseIcon name="i-lucide-calendar" class="size-4 shrink-0" />
                  {{ eventDate }}
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <BaseIcon name="i-lucide-map-pin" class="size-4 shrink-0" />
                  {{ eventLocation }}
                </span>
              </p>
            </div>
          </div>

          <!-- TICKETS -->
          <UiPanel
            as="section"
            variant="glass"
            radius="xl"
            padding="lg"
            class="space-y-5 lg:sticky lg:top-24"
          >
            <div class="space-y-2">
              <BaseBadge kind="status" color="primary" size="xs">
                Compra de entradas
              </BaseBadge>
              <h2 class="text-3xl font-display text-highlighted sm:text-4xl">
                Entradas
              </h2>
              <p class="text-sm leading-relaxed text-toned">
                Elegí tu tipo de entrada y cantidad para reservar más rápido.
              </p>
              <p class="text-xs text-muted">
                Vas a poder revisar todo el pedido antes de confirmar el pago.
              </p>
            </div>

            <div v-if="loadingTicketTypes" class="space-y-3">
              <BaseSpinner class="h-28 rounded-2xl" />
              <BaseSpinner class="h-28 rounded-2xl" />
            </div>

            <div v-else-if="ticketTypesError" class="rounded-2xl border border-warning/30 bg-warning/8 px-4 py-4 text-sm leading-relaxed text-toned">
              <p>{{ ticketTypesError }}</p>
              <BaseButton variant="outlined" size="sm" leading-icon="i-lucide-rotate-ccw" class="mt-3" @click="loadTicketTypes()">
                Reintentar
              </BaseButton>
            </div>

            <UiEmptyState
              v-else-if="!hasTicketTypes"
              icon="i-lucide-ticket-x"
              title="Todavía no hay entradas públicas"
              description="Volvé más cerca de la fecha de venta para elegir tus lugares."
            />

            <template v-else>
              <CheckoutPublicTicketCard
                :ticket-types="ticketTypes"
                :loading="loadingTicketTypes"
                :currency="event.currency"
                @update:selection="handleSelectionUpdate"
              />

              <BaseButton
                variant="primary"
                size="lg"
                class="w-full"
                :disabled="!canBuy || loadingTicketTypes || buyLoading || !isPurchasable"
                :loading="buyLoading"
                @click="handleBuy"
              >
                {{ checkoutCtaText }}
              </BaseButton>

              <div class="grid gap-2 pt-1 text-xs text-toned sm:grid-cols-2">
                <p class="inline-flex items-center gap-1.5">
                  <BaseIcon name="i-lucide-shield-check" class="size-3.5 text-success" />
                  Checkout seguro
                </p>
                <p class="inline-flex items-center gap-1.5 sm:justify-end">
                  <BaseIcon name="i-lucide-receipt-text" class="size-3.5 text-success" />
                  Revisás antes de pagar
                </p>
              </div>
            </template>
          </UiPanel>
        </div>

        <!-- LINEUP + VENUE -->
        <UiPanel as="section" variant="glass" radius="xl" padding="lg" class="space-y-5">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div class="space-y-2">
              <UiMetaLabel>Lineup + recinto</UiMetaLabel>
              <h3 class="text-2xl font-display text-highlighted sm:text-3xl">
                Artistas confirmados
              </h3>
              <p class="text-sm leading-relaxed text-toned">
                El lineup es la parte central de esta fecha. Conocé quién toca y en qué orden.
              </p>
            </div>
            <BaseBadge kind="tag" color="primary" size="sm" class="rounded-full">
              {{ lineupItems.length }} artistas
            </BaseBadge>
          </div>

          <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
            <div class="space-y-3">
              <div v-if="lineupStatus === 'pending'" class="space-y-3">
                <BaseSpinner v-for="index in 3" :key="index" class="h-20 rounded-2xl" />
              </div>

              <div v-else-if="lineupErrorMessage" class="rounded-2xl border border-warning/30 bg-warning/8 px-4 py-4 text-sm leading-relaxed text-toned">
                <p>{{ lineupErrorMessage }}</p>
                <BaseButton variant="outlined" size="sm" leading-icon="i-lucide-rotate-ccw" class="mt-3" @click="refreshLineup()">
                  Reintentar
                </BaseButton>
              </div>

              <div v-else-if="lineupItems.length === 0" class="rounded-2xl border border-default/55 bg-elevated/25 px-4 py-4 text-sm leading-relaxed text-toned">
                Todavía no hay lineup público publicado para este evento.
              </div>

              <div v-else class="space-y-5">
                <div
                  v-for="group in lineupGroups"
                  :key="group.key"
                  class="space-y-3"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-xs font-semibold tracking-[0.14em] text-dimmed uppercase">
                        {{ group.title }}
                      </p>
                      <p class="text-xs text-toned">
                        {{ group.subtitle }}
                      </p>
                    </div>
                    <BaseBadge kind="tag" size="xs" class="rounded-full">
                      {{ group.items.length }}
                    </BaseBadge>
                  </div>

                  <NuxtLink
                    v-for="artistItem in group.items"
                    :key="artistItem.id"
                    :to="`/artists/${artistItem.artist.id}`"
                    class="flex items-center gap-4 rounded-2xl border px-4 py-4 transition-colors hover:border-lavender/35 hover:bg-elevated/35"
                    :class="artistItem.role === 'HEADLINER'
                      ? 'border-lavender/45 bg-lavender/8'
                      : 'border-default/55 bg-elevated/25'"
                  >
                    <div v-if="artistItem.artist.imageUrl" class="size-14 overflow-hidden rounded-full border border-default/55 bg-default/40">
                      <NuxtImg
                        :src="artistItem.artist.imageUrl"
                        :alt="`Imagen de ${artistItem.artist.name}`"
                        class="size-full object-cover"
                        width="160"
                        height="160"
                        placeholder
                      />
                    </div>
                    <BaseAvatar v-else :text="artistInitials(artistItem.artist.name)" size="lg" class="size-14! border border-default/55" />

                    <div class="min-w-0 flex-1 space-y-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="truncate text-base font-semibold text-highlighted">
                          {{ artistItem.artist.name }}
                        </p>
                        <BaseBadge kind="tag" size="xs">
                          {{ roleLabels[artistItem.role] ?? artistItem.role }}
                        </BaseBadge>
                        <BaseBadge v-if="artistItem.role === 'HEADLINER'" kind="status" color="primary" size="xs">
                          Main act
                        </BaseBadge>
                      </div>
                      <p class="text-sm text-toned">
                        {{ artistItem.artist.country || 'País no informado' }}
                      </p>
                    </div>

                    <div class="shrink-0 text-right">
                      <p class="text-sm font-medium text-highlighted">
                        #{{ artistItem.performanceOrder }}
                      </p>
                      <p class="text-xs text-toned">
                        {{ formatPerformanceTime(artistItem.performanceTime) }}
                      </p>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-default/45 bg-default/10 p-4 sm:p-5 lg:sticky lg:top-28">
              <div class="space-y-4">
                <div class="overflow-hidden rounded-xl border border-default/45 bg-default/20">
                  <NuxtImg
                    v-if="event.venue.imageUrl"
                    :src="event.venue.imageUrl"
                    :alt="`Imagen de ${event.venue.name}`"
                    class="h-44 w-full object-cover"
                    width="640"
                    height="360"
                    placeholder
                  />
                  <div v-else class="flex h-44 items-center justify-center px-4 text-center">
                    <div class="space-y-1">
                      <BaseIcon name="i-lucide-map-pinned" class="mx-auto size-6 text-muted" />
                      <p class="text-xs text-toned">
                        Sin imagen del recinto
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <BaseBadge kind="tag" size="xs">
                    {{ event.venue.city }}
                  </BaseBadge>
                  <BaseBadge kind="tag" size="xs">
                    {{ event.venue.country }}
                  </BaseBadge>
                </div>

                <UiMetaLabel>Recinto</UiMetaLabel>
                <p class="text-lg font-semibold text-highlighted">
                  {{ event.venue.name }}
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  {{ event.venue.address }}, {{ event.venue.city }}
                </p>
              </div>

              <BaseButton variant="secondary" size="md" :to="`/venues/${event.venue.id}`" class="mt-5 w-full">
                Ver venue
              </BaseButton>
            </div>
          </div>
        </UiPanel>

        <!-- SECONDARY METADATA -->
        <UiPanel as="section" variant="glass" radius="xl" padding="lg" class="space-y-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-2">
              <UiMetaLabel as="h3">Información del evento</UiMetaLabel>
              <p class="text-sm text-toned">
                Una vista rápida y clara para organizar tu asistencia.
              </p>
            </div>
            <BaseBadge kind="tag" color="primary" size="sm" class="rounded-full">
              Ficha técnica
            </BaseBadge>
          </div>

          <div class="flex flex-wrap gap-2">
            <BaseBadge kind="status" :color="eventStatusColor" size="xs">
              {{ eventStatusLabel }}
            </BaseBadge>
            <BaseBadge kind="price" color="primary" size="xs">
              {{ event.currency }}
            </BaseBadge>
            <BaseBadge kind="tag" size="xs">
              {{ eventDate }}
            </BaseBadge>
          </div>

          <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-stretch">
            <div class="rounded-2xl border border-default/45 bg-default/10 p-4 sm:p-5">
              <div class="flex items-start gap-2.5">
                <BaseIcon name="i-lucide-scroll-text" class="mt-0.5 size-4 shrink-0 text-lavender" />
                <div class="space-y-2">
                  <UiMetaLabel>Detalle</UiMetaLabel>
                  <p v-if="event.description" class="text-sm leading-relaxed text-toned sm:text-base">
                    {{ event.description }}
                  </p>
                  <p v-else class="text-sm leading-relaxed text-toned">
                    No hay descripción pública para este evento todavía.
                  </p>
                </div>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-default/45 bg-elevated/18 p-4">
                <div class="flex items-start justify-between gap-3">
                  <UiMetaLabel>Capacidad</UiMetaLabel>
                  <BaseIcon name="i-lucide-users" class="size-4 text-lavender" />
                </div>
                <p class="mt-2 text-base font-semibold text-highlighted">
                  {{ event.maxCapacity.toLocaleString('es-ES') }} personas
                </p>
                <p v-if="event.venue.capacity !== null" class="mt-1 text-xs text-toned">
                  Recinto: {{ event.venue.capacity.toLocaleString('es-ES') }}
                </p>
              </div>

              <div class="rounded-2xl border border-default/45 bg-elevated/18 p-4">
                <div class="flex items-start justify-between gap-3">
                  <UiMetaLabel>Puertas</UiMetaLabel>
                  <BaseIcon name="i-lucide-door-open" class="size-4 text-lavender" />
                </div>
                <p class="mt-2 text-base font-semibold text-highlighted">
                  {{ doorsOpen }}
                </p>
              </div>

              <div class="rounded-2xl border border-default/45 bg-elevated/18 p-4">
                <div class="flex items-start justify-between gap-3">
                  <UiMetaLabel>Preventa</UiMetaLabel>
                  <BaseIcon name="i-lucide-calendar-clock" class="size-4 text-lavender" />
                </div>
                <p class="mt-2 text-base font-semibold text-highlighted">
                  {{ startSale }}
                </p>
              </div>

              <div class="rounded-2xl border border-default/45 bg-elevated/18 p-4">
                <div class="flex items-start justify-between gap-3">
                  <UiMetaLabel>Cierre de venta</UiMetaLabel>
                  <BaseIcon name="i-lucide-alarm-clock-check" class="size-4 text-lavender" />
                </div>
                <p class="mt-2 text-base font-semibold text-highlighted">
                  {{ endSale }}
                </p>
              </div>
            </div>
          </div>
        </UiPanel>

        <!-- Sales Report CTA (admin only, subtle) -->
        <UiPanel
          as="section"
          variant="solid"
          radius="lg"
          padding="lg"
          v-if="user?.role === 'ADMIN' || user?.role === 'CREATOR'"
          class="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left"
        >
          <div class="space-y-1">
            <UiMetaLabel>Backoffice</UiMetaLabel>
            <p class="text-sm text-toned">
              Accedé al reporte completo de ventas de este evento.
            </p>
          </div>
          <BaseButton
            variant="outlined"
            size="sm"
            :to="`/backoffice/events/${eventId}/sales`"
            leading-icon="i-lucide-bar-chart-2"
          >
            Ver reporte de ventas
          </BaseButton>
        </UiPanel>
      </div>

      <div v-else class="rounded-2xl border border-error/30 bg-error/8 px-6 py-16 text-center">
        <div class="mx-auto flex max-w-md flex-col items-center gap-4">
          <BaseIcon name="i-lucide-cloud-off" class="size-8 text-error" />
          <div class="space-y-2">
            <p class="text-lg font-semibold text-highlighted">
              No pudimos preparar esta vista.
            </p>
            <p class="text-sm leading-relaxed text-toned">
              {{ eventErrorMessage || 'Intentá recargar la página en unos segundos.' }}
            </p>
          </div>
          <BaseButton variant="outlined" size="sm" leading-icon="i-lucide-rotate-ccw" @click="refreshEvent()">
            Reintentar
          </BaseButton>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
