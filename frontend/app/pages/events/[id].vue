<script setup lang="ts">
import type { TicketType } from '~~/shared/types/domain'
import { formatEventDate } from '@/utils/date-formatters'
import { useTicketTypesRepository } from '@/repositories/ticketTypesRepository'

const route = useRoute()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()
const { isAuthenticated } = useAuth()
const { add: addToast } = useToastQueue()

const roleLabels: Record<string, string> = {
  HEADLINER: 'Cabeza de cartel',
  SPECIAL_GUEST: 'Invitado especial',
  OPENER: 'Apertura',
}

const eventId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

const { data: event, status, error } = await usePublicEvent(eventId)
const { data: lineup, status: lineupStatus, error: lineupError } = await usePublicEventArtists(eventId)

// ── Ticket Types ──────────────────────────────────────────────────────────────
const ticketTypes = ref<TicketType[]>([])
const loadingTicketTypes = ref(false)

onMounted(async () => {
  if (!eventId.value) return
  loadingTicketTypes.value = true
  try {
    ticketTypes.value = await useTicketTypesRepository().getByEvent(eventId.value)
  }
  catch {
    // Silent — no ticket types available
  }
  finally {
    loadingTicketTypes.value = false
  }
})

// ── Selection & Purchase ──────────────────────────────────────────────────────
const selection = ref<Array<{ ticketTypeId: string; quantity: number; unitPrice: number }>>([])
const buyLoading = ref(false)

const canBuy = computed(() => selection.value.some(item => item.quantity > 0))

function handleSelectionUpdate(items: Array<{ ticketTypeId: string; quantity: number; unitPrice: number }>) {
  selection.value = items
}

async function handleBuy() {
  if (!canBuy.value || buyLoading.value) return

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
        <BaseSkeleton class="h-16 rounded-2xl" />
        <BaseSkeleton class="h-120 rounded-3xl" />
      </div>

      <div v-else-if="event" class="mx-auto max-w-7xl space-y-8">
        <NuxtLink to="/events" class="inline-flex items-center gap-2 text-sm text-toned transition-colors hover:text-highlighted">
          <BaseIcon name="i-lucide-arrow-left" class="size-4" />
          Volver a eventos
        </NuxtLink>

        <div class="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <div class="overflow-hidden rounded-3xl border border-default/55 bg-elevated/20 shadow-soft">
            <NuxtImg
              v-if="event.imageUrl"
              :src="event.imageUrl"
              :alt="`Imagen de ${event.name}`"
              class="min-h-88 w-full object-cover lg:min-h-168"
              width="1200"
              height="1600"
              sizes="(max-width: 1023px) 100vw, 58vw"
              placeholder
            />

            <div v-else class="flex min-h-88 items-center justify-center px-8 py-16 text-center lg:min-h-168">
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
          </div>

          <UiPanel as="section" variant="glass" radius="xl" padding="lg" class="space-y-8">
            <div class="space-y-5 border-b border-default/55 pb-7">
              <div class="flex flex-wrap gap-2">
                <BaseBadge v-for="genre in event.genres" :key="genre.id" kind="tag" size="xs">
                  {{ genre.name }}
                </BaseBadge>
              </div>

              <div class="space-y-3">
                <p class="text-xs font-medium tracking-[0.28em] text-muted uppercase">
                  {{ event.venue.city }}
                </p>
                <h1 class="font-display text-3xl leading-tight text-highlighted sm:text-4xl lg:text-5xl">
                  {{ event.name }}
                </h1>
                <p v-if="genreLabels" class="text-sm font-medium tracking-wide text-dimmed uppercase">
                  {{ genreLabels }}
                </p>
              </div>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <div class="space-y-2">
                <UiMetaLabel>Fecha</UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ eventDate }}
                </p>
              </div>

              <div class="space-y-2">
                <UiMetaLabel>Puertas</UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ doorsOpen }}
                </p>
              </div>

              <div class="space-y-2">
                <UiMetaLabel>Preventa</UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ startSale }}
                </p>
              </div>

              <div class="space-y-2">
                <UiMetaLabel>Cierre de venta</UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ endSale }}
                </p>
              </div>

              <div class="space-y-2 sm:col-span-2">
                <UiMetaLabel>Ubicación</UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ eventLocation }}
                </p>
                <p class="text-sm text-toned">
                  {{ event.venue.address }}
                </p>
              </div>

              <div class="space-y-2 sm:col-span-2">
                <UiMetaLabel>Capacidad</UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ event.maxCapacity.toLocaleString('es-ES') }} personas
                </p>
                <p v-if="event.venue.capacity !== null" class="text-sm text-toned">
                  Capacidad pública del recinto: {{ event.venue.capacity.toLocaleString('es-ES') }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-3 border-y border-default/55 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <UiMetaLabel>Recinto</UiMetaLabel>
                <p class="mt-2 text-sm text-toned">
                  {{ event.venue.name }}
                </p>
              </div>

              <BaseButton variant="secondary" size="lg" :to="`/venues/${event.venue.id}`" class="px-6">
                Ver venue
              </BaseButton>
            </div>

            <div class="space-y-3">
              <UiMetaLabel>Detalle</UiMetaLabel>
              <p v-if="event.description" class="max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
                {{ event.description }}
              </p>
              <p v-else class="text-sm leading-relaxed text-toned">
                No hay descripción pública para este evento todavía.
              </p>
            </div>

            <!-- Ticket Types & Purchase -->
            <div class="space-y-4 border-t border-default/55 pt-7">
              <div class="space-y-2">
                <UiMetaLabel>Entradas</UiMetaLabel>
                <p class="text-sm leading-relaxed text-toned">
                  Seleccioná el tipo de entrada y la cantidad.
                </p>
              </div>

              <CheckoutTicketTypeSelector
                :ticket-types="ticketTypes"
                :loading="loadingTicketTypes"
                @update:selection="handleSelectionUpdate"
              />

              <BaseButton
                variant="primary"
                size="lg"
                class="w-full"
                :disabled="!canBuy || loadingTicketTypes || buyLoading"
                :loading="buyLoading"
                @click="handleBuy"
              >
                Comprar
              </BaseButton>
            </div>

            <div class="space-y-4 border-t border-default/55 pt-7">
              <div class="space-y-2">
                <UiMetaLabel>Lineup</UiMetaLabel>
                <p class="text-sm leading-relaxed text-toned">
                  Artistas confirmados por el backend público para este evento.
                </p>
              </div>

              <div v-if="lineupStatus === 'pending'" class="space-y-3">
                <BaseSkeleton v-for="index in 3" :key="index" class="h-20 rounded-2xl" />
              </div>

              <div v-else-if="lineupErrorMessage" class="rounded-2xl border border-warning/30 bg-warning/8 px-4 py-4 text-sm leading-relaxed text-toned">
                {{ lineupErrorMessage }}
              </div>

              <div v-else-if="lineupItems.length === 0" class="rounded-2xl border border-default/55 bg-elevated/25 px-4 py-4 text-sm leading-relaxed text-toned">
                Todavía no hay lineup público publicado para este evento.
              </div>

              <div v-else class="space-y-3">
                <NuxtLink
                  v-for="artistItem in lineupItems"
                  :key="artistItem.id"
                  :to="`/artists/${artistItem.artist.id}`"
                  class="flex items-center gap-4 rounded-2xl border border-default/55 bg-elevated/25 px-4 py-4 transition-colors hover:border-default/80 hover:bg-elevated/35"
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
                      <p class="truncate font-semibold text-highlighted">
                        {{ artistItem.artist.name }}
                      </p>
                      <BaseBadge kind="tag" size="xs">
                        {{ roleLabels[artistItem.role] ?? artistItem.role }}
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
          </UiPanel>
        </div>
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
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
