<script setup lang="ts">
import type {
  BackofficeEventRecord,
  BackofficeRequiresAttentionRecord,
  BackofficeTopEventRecord,
  BackofficeUpcomingEventRecord,
} from '~~/shared/types'
import { useBackofficeEventsRepository } from '@/repositories/backofficeEventsRepository'

definePageMeta({
  layout: 'backoffice',
  middleware: 'backoffice',
})

useSeoMeta({
  title: 'Dashboard | Backoffice VeriTix',
  description: 'Dashboard operativo del backoffice con métricas, revenue, actividad y seguimiento.',
})

const repo = useBackofficeEventsRepository()
const { notifyApiError } = useAppNotifications()

// --- State ---
const events = ref<BackofficeEventRecord[]>([])
const upcoming = ref<BackofficeUpcomingEventRecord[]>([])
const topEvents = ref<BackofficeTopEventRecord[]>([])
const attentionItems = ref<BackofficeRequiresAttentionRecord[]>([])

const pendingEvents = ref(true)
const pendingUpcoming = ref(true)
const pendingTop = ref(true)
const pendingAttention = ref(true)

const errorUpcoming = ref(false)
const errorTop = ref(false)
const errorAttention = ref(false)

const anyPending = computed(() => pendingEvents.value || pendingUpcoming.value || pendingTop.value || pendingAttention.value)

// Cross-reference catalog data for top events (top-events endpoint lacks imageUrl and status)
const eventCatalogMap = computed(() => {
  const map = new Map<string, BackofficeEventRecord>()
  for (const event of events.value) {
    map.set(event.id, event)
  }
  return map
})

function topEventImage(eventId: string): string | null {
  return eventCatalogMap.value.get(eventId)?.imageUrl ?? null
}

// Only show PUBLISHED events in Top Events — drafts/cancelled don't belong there
const publishedTopEvents = computed(() =>
  topEvents.value.filter((event) => {
    const catalogEntry = eventCatalogMap.value.get(event.id)
    return catalogEntry?.status === 'PUBLISHED'
  }),
)

const publishedRevenue = computed(() =>
  publishedTopEvents.value.reduce((sum, e) => sum + e.revenue, 0),
)

// --- Metrics ---
const metrics = computed(() => {
  const totalEvents = events.value.length
  const upcomingCount = upcoming.value.length
  const totalTickets = upcoming.value.reduce((sum, e) => sum + e.ticketsSold, 0)
  const attentionCount = attentionItems.value.length

  return [
    {
      label: 'Eventos totales',
      value: totalEvents,
      hint: `${upcomingCount} próximos`,
      icon: 'i-lucide-calendar',
      variant: 'primary' as const,
    },
    {
      label: 'Próximos',
      value: upcomingCount,
      hint: 'en agenda',
      icon: 'i-lucide-calendar-clock',
      variant: 'success' as const,
    },
    {
      label: 'Tickets vendidos',
      value: totalTickets.toLocaleString('es-AR'),
      hint: 'total acumulado',
      icon: 'i-lucide-ticket',
      variant: 'warning' as const,
    },
    {
      label: 'Revenue',
      value: formatCurrency(publishedRevenue.value),
      hint: 'ingresos estimados',
      icon: 'i-lucide-dollar-sign',
      variant: 'success' as const,
    },
    {
      label: 'Requieren atención',
      value: attentionCount,
      hint: attentionCount > 0 ? 'pendientes de revisión' : 'todo en orden',
      icon: 'i-lucide-triangle-alert',
      variant: attentionCount > 0 ? 'error' as const : 'success' as const,
    },
  ]
})

// --- Occupancy ---
function occupancyRate(sold: number, capacity: number): number {
  if (capacity <= 0) { return 0 }
  return Math.min(100, Math.round((sold / capacity) * 100))
}

function occupancyColor(rate: number): string {
  if (rate >= 80) { return 'bg-error' }
  if (rate >= 60) { return 'bg-warning' }
  return 'bg-success'
}

// --- Revenue bar ---
const maxRevenue = computed(() => {
  if (publishedTopEvents.value.length === 0) { return 1 }
  return Math.max(...publishedTopEvents.value.map(e => e.revenue), 1)
})

function revenueBarWidth(revenue: number): number {
  if (maxRevenue.value <= 0) { return 0 }
  return Math.round((revenue / maxRevenue.value) * 100)
}

// --- Helpers ---
function formatCurrency(amount: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
}

function getStatusTone(status: string): 'success' | 'warning' | 'error' | 'neutral' {
  if (status === 'PUBLISHED') { return 'success' }
  if (status === 'DRAFT') { return 'warning' }
  if (status === 'CANCELLED') { return 'error' }
  return 'neutral'
}

function getStatusLabel(status: string): string {
  if (status === 'PUBLISHED') { return 'Publicado' }
  if (status === 'DRAFT') { return 'Borrador' }
  if (status === 'CANCELLED') { return 'Cancelado' }
  return status
}

function statCardIconBoxClass(variant: string): string {
  const base = 'flex size-10 items-center justify-center rounded-lg border'

  if (variant === 'primary') { return `${base} border-primary/20 bg-primary/10 text-primary` }
  if (variant === 'warning') { return `${base} border-warning/20 bg-warning/10 text-warning` }
  if (variant === 'success') { return `${base} border-success/20 bg-success/10 text-success` }
  if (variant === 'error') { return `${base} border-error/20 bg-error/10 text-error` }

  return `${base} border-default bg-default/60 text-muted`
}

function attentionItemTone(status: string): 'warning' | 'success' | 'error' | 'default' {
  if (status === 'DRAFT') { return 'warning' }
  if (status === 'CANCELLED') { return 'error' }
  if (status === 'PUBLISHED') { return 'success' }
  return 'default'
}

function attentionIconClass(tone: 'warning' | 'success' | 'error' | 'default'): string {
  if (tone === 'warning') { return 'text-warning' }
  if (tone === 'success') { return 'text-success' }
  if (tone === 'error') { return 'text-error' }
  return 'text-muted'
}

// --- Fetch ---
async function loadDashboard(): Promise<void> {
  pendingEvents.value = true
  pendingUpcoming.value = true
  pendingTop.value = true
  pendingAttention.value = true

  const [eventsResult, upcomingResult, topResult, attentionResult] = await Promise.allSettled([
    repo.listCatalog({
      pageValue: 1,
      pageSize: 50,
      filters: { search: '', city: '', genreId: '', formatId: '', dateFrom: '', dateTo: '' },
      quickWindow: 'all',
    }),
    repo.listUpcoming({ limit: 8 }),
    repo.listTopEvents({ limit: 5 }),
    repo.listRequiresAttention(),
  ])

  if (eventsResult.status === 'fulfilled') {
    events.value = eventsResult.value.data
  }
  else {
    notifyApiError(eventsResult.reason, 'No pudimos cargar el resumen de eventos.', { id: 'dashboard-events-error' })
  }
  pendingEvents.value = false

  if (upcomingResult.status === 'fulfilled') {
    upcoming.value = upcomingResult.value
  }
  else {
    errorUpcoming.value = true
  }
  pendingUpcoming.value = false

  if (topResult.status === 'fulfilled') {
    topEvents.value = topResult.value
  }
  else {
    errorTop.value = true
  }
  pendingTop.value = false

  if (attentionResult.status === 'fulfilled') {
    attentionItems.value = attentionResult.value
  }
  else {
    errorAttention.value = true
  }
  pendingAttention.value = false
}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <!-- Header with actions -->
        <header class="border-b border-white/16 pb-8 pt-3 sm:pt-4">
          <div class="relative flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="min-w-0 max-w-4xl space-y-4 lg:flex-1">
              <UiMetaLabel tone="accent">
                Backoffice
              </UiMetaLabel>
              <h1 class="font-display text-3xl leading-none tracking-tight text-highlighted sm:text-4xl lg:text-6xl">
                Dashboard
              </h1>
              <p class="max-w-3xl text-sm leading-relaxed text-toned sm:text-base">
                Resumen operativo del backoffice con métricas, revenue, actividad y seguimiento rápido.
              </p>
            </div>
            <div class="flex shrink-0 flex-wrap gap-3 lg:ml-auto">
              <BaseButton
                variant="primary"
                size="sm"
                to="/backoffice/events/new"
                leading-icon="i-lucide-calendar-plus"
              >
                Crear evento
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="sm"
                to="/backoffice/events"
                leading-icon="i-lucide-store"
              >
                Ver catálogo
              </BaseButton>
            </div>
          </div>
        </header>

        <!-- KPI Cards -->
        <div class="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          <template v-if="anyPending">
            <UiPanel v-for="i in 2" :key="i" variant="glass" radius="md" padding="md" class="col-span-1 md:col-span-1 xl:col-span-2">
              <div class="flex min-h-28 items-center justify-center">
                <BaseSpinner class="size-10" spinner-class="size-10" />
              </div>
            </UiPanel>
          </template>

          <UiPanel
            v-for="metric in metrics"
            v-else
            :key="metric.label"
            variant="glass"
            radius="md"
            padding="md"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-3">
                <UiMetaLabel>
                  {{ metric.label }}
                </UiMetaLabel>

                <div class="space-y-1">
                  <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                    {{ metric.value }}
                  </p>
                  <p v-if="metric.hint" class="text-sm text-toned">
                    {{ metric.hint }}
                  </p>
                </div>
              </div>

              <div :class="statCardIconBoxClass(metric.variant)">
                <BaseIcon :name="metric.icon" class="size-5" />
              </div>
            </div>
          </UiPanel>
        </div>

        <!-- Two-column: Top Events + Attention -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Top Events -->
          <PagesBackofficeOverviewPanel title="Top eventos" description="Mayor revenue estimado." variant="glass">
            <div v-if="pendingTop" class="space-y-3">
              <div class="flex min-h-36 items-center justify-center">
                <BaseSpinner class="size-8" spinner-class="size-8" />
              </div>
            </div>

            <UiEmptyState
              v-else-if="publishedTopEvents.length === 0"
              icon="i-lucide-trending-up"
              title="Sin datos de revenue aún"
              description="A medida que se vendan tickets, los eventos publicados con mayor recaudación aparecerán acá."
            />

            <div v-else class="space-y-3">
              <div
                v-for="event in publishedTopEvents"
                :key="event.id"
                class="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl border border-default/60 bg-default/25 p-3 sm:px-4 sm:py-3"
              >
                <div class="size-10 shrink-0 overflow-hidden rounded-lg border border-default/40 bg-default/50 sm:size-12">
                  <img
                    v-if="topEventImage(event.id)"
                    :src="topEventImage(event.id)!"
                    :alt="event.name"
                    class="size-full object-cover"
                  >
                  <div v-else class="flex size-full items-center justify-center text-muted">
                    <BaseIcon name="i-lucide-image" class="size-4 sm:size-5" />
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 mb-1">
                    <NuxtLink
                      :to="`/backoffice/events/${event.id}/edit`"
                      class="block min-w-0 truncate text-sm font-semibold text-highlighted transition-colors duration-150 hover:text-primary"
                    >
                      {{ event.name }}
                    </NuxtLink>
                    <span class="shrink-0 text-sm font-semibold text-success">
                      {{ formatCurrency(event.revenue) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-toned mb-2">
                    <BaseIcon name="i-lucide-map-pin" class="size-3 shrink-0" />
                    <span class="min-w-0 truncate">{{ event.venue.name }}</span>
                  </div>
                  <div
                    v-if="event.revenue > 0"
                    class="flex items-center gap-2"
                  >
                    <div class="h-1.5 flex-1 rounded-full bg-default/15">
                      <div
                        class="h-full rounded-full bg-success transition-all duration-500"
                        :style="{ width: `${revenueBarWidth(event.revenue)}%` }"
                      />
                    </div>
                    <span class="shrink-0 text-xs tabular-nums text-toned">{{ revenueBarWidth(event.revenue) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </PagesBackofficeOverviewPanel>

          <!-- Requires Attention -->
          <PagesBackofficeOverviewPanel title="Requiere atención" description="Incidencias operativas detectadas." variant="glass">
            <div v-if="pendingAttention" class="space-y-3">
              <div class="flex min-h-36 items-center justify-center">
                <BaseSpinner class="size-8" spinner-class="size-8" />
              </div>
            </div>

            <UiEmptyState
              v-else-if="attentionItems.length === 0"
              icon="i-lucide-check-circle"
              title="Sin incidencias"
              description="Todo en orden — no hay eventos que requieran atención en este momento."
            />

            <div v-else class="space-y-3">
              <div
                v-for="item in attentionItems"
                :key="item.id"
                class="rounded-xl border border-default/60 bg-default/25 p-3 sm:px-4 sm:py-3"
              >
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex flex-wrap items-center gap-2 min-w-0">
                    <NuxtLink
                      :to="`/backoffice/events/${item.id}/edit`"
                      class="block min-w-0 break-words text-sm font-semibold text-highlighted transition-colors duration-150 hover:text-primary"
                    >
                      {{ item.name }}
                    </NuxtLink>
                    <BaseBadge kind="status" :color="getStatusTone(item.status)" size="sm">
                      {{ getStatusLabel(item.status) }}
                    </BaseBadge>
                  </div>
                </div>
                <ul class="space-y-1">
                  <li
                    v-for="issue in item.issues"
                    :key="issue"
                    class="flex items-start gap-2 text-xs text-toned"
                  >
                    <BaseIcon
                      name="i-lucide-circle-alert"
                      class="mt-0.5 size-3 shrink-0"
                      :class="attentionIconClass(attentionItemTone(item.status))"
                    />
                    <span class="min-w-0 break-words">{{ issue }}</span>
                  </li>
                </ul>
                <div class="mt-3 flex justify-end">
                  <BaseButton
                    variant="outlined"
                    size="xs"
                    :to="`/backoffice/events/${item.id}/edit`"
                    trailing-icon="i-lucide-arrow-right"
                  >
                    Editar
                  </BaseButton>
                </div>
              </div>
            </div>
          </PagesBackofficeOverviewPanel>
        </div>

        <!-- Upcoming Events -->
        <PagesBackofficeOverviewPanel title="Próximos eventos" description="Agenda con ocupación en tiempo real." variant="glass">
          <div v-if="pendingUpcoming" class="space-y-3">
            <div class="flex min-h-36 items-center justify-center">
              <BaseSpinner class="size-8" spinner-class="size-8" />
            </div>
          </div>

          <UiEmptyState
            v-else-if="upcoming.length === 0"
            icon="i-lucide-calendar-x"
            title="No hay próximos eventos"
            description="Creá un evento nuevo para empezar a poblar la agenda operativa del dashboard."
            action-label="Crear evento"
            action-to="/backoffice/events/new"
          />

          <div v-else class="overflow-x-auto rounded-xl border border-default/65">
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="border-b border-default/60 text-left text-xs tracking-wide text-muted uppercase">
                  <th class="px-4 py-3">
                    Evento
                  </th>
                  <th class="px-4 py-3">
                    Fecha
                  </th>
                  <th class="px-4 py-3 hidden sm:table-cell">
                    Recinto
                  </th>
                  <th class="px-4 py-3">
                    Vendidos
                  </th>
                  <th class="px-4 py-3 hidden md:table-cell">
                    Ocupación
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="event in upcoming"
                  :key="event.id"
                  class="border-b border-default/50 last:border-0"
                >
                  <td class="px-4 py-3">
                    <NuxtLink
                      :to="`/backoffice/events/${event.id}/edit`"
                      class="text-highlighted transition-colors duration-150 hover:text-primary"
                    >
                      {{ event.name }}
                    </NuxtLink>
                  </td>
                  <td class="px-4 py-3 text-toned text-xs">
                    {{ formatDateTime(event.eventDate) }}
                  </td>
                  <td class="px-4 py-3 text-toned text-xs hidden sm:table-cell">
                    {{ event.venue.name }}
                  </td>
                  <td class="px-4 py-3 text-xs">
                    <span class="font-semibold text-highlighted">{{ event.ticketsSold.toLocaleString('es-AR') }}</span>
                    <span class="text-toned"> / {{ event.totalCapacity.toLocaleString('es-AR') }}</span>
                  </td>
                  <td class="px-4 py-3 hidden md:table-cell">
                    <div class="flex items-center gap-2">
                      <div class="h-2 w-20 rounded-full bg-default/30">
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          :class="occupancyColor(occupancyRate(event.ticketsSold, event.totalCapacity))"
                          :style="{ width: `${occupancyRate(event.ticketsSold, event.totalCapacity)}%` }"
                        />
                      </div>
                      <span class="text-xs text-toned tabular-nums">
                        {{ occupancyRate(event.ticketsSold, event.totalCapacity) }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
