<script setup lang="ts">
import type { EventOrderStatus } from '~~/shared/api/orders'

definePageMeta({ layout: 'backoffice', middleware: 'sales-report' })
useSeoMeta({ title: 'Reporte de ventas | Backoffice VeriTix' })

const route = useRoute()
const eventId = computed(() => String(route.params.id || ''))

// Event detail (hero image + title)
const { event } = useEventDetail(eventId)

// Metrics composable
const { metrics, isLoading: metricsLoading, avgTicketPrice } = useEventMetrics(eventId)

// Orders (paginated table)
const {
  orders,
  meta,
  isLoading,
  error,
  statusFilter,
  page,
  fetch,
  setPage,
  setStatusFilter,
} = useEventOrders(eventId)

const STATUS_OPTIONS: Array<{ label: string, value: EventOrderStatus | undefined }> = [
  { label: 'Todos', value: undefined },
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Completado', value: 'COMPLETED' },
  { label: 'Cancelado', value: 'CANCELLED' },
]

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount)
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(dateString))
}

function statusColor(status: EventOrderStatus): 'success' | 'warning' | 'neutral' {
  if (status === 'COMPLETED') { return 'success' }
  if (status === 'PENDING') { return 'warning' }
  return 'neutral'
}

function statusLabel(status: EventOrderStatus): string {
  if (status === 'COMPLETED') { return 'Completado' }
  if (status === 'PENDING') { return 'Pendiente' }
  return 'Cancelado'
}

onMounted(() => {
  void fetch()
})

// Title from event detail
const eventName = computed(() => event.value?.name ?? '')

// Order metrics from useEventMetrics (server-computed totals)
const totalOrders = computed(() => metrics.value?.orders.total ?? 0)
const completedRevenue = computed(() => metrics.value?.revenue.total ?? 0)
const pendingCount = computed(() => metrics.value?.orders.pending ?? 0)
const cancelledCount = computed(() => metrics.value?.orders.cancelled ?? 0)

// Segmented bar percentages
const ordersTotal = computed(() => metrics.value?.orders.total ?? 0)
const completedPct = computed(() => ordersTotal.value > 0
  ? (metrics.value!.orders.completed / ordersTotal.value) * 100
  : 0)
const pendingPct = computed(() => ordersTotal.value > 0
  ? (metrics.value!.orders.pending / ordersTotal.value) * 100
  : 0)
const cancelledPct = computed(() => ordersTotal.value > 0
  ? (metrics.value!.orders.cancelled / ordersTotal.value) * 100
  : 0)
const completedCount = computed(() => metrics.value?.orders.completed ?? 0)

// Ticket type breakdown
const ticketTypeData = computed(() => metrics.value?.revenue.byTicketType ?? [])
const maxTicketRevenue = computed(() => {
  if (ticketTypeData.value.length === 0) { return 1 }
  return Math.max(...ticketTypeData.value.map(tt => tt.revenue))
})

// Revenue chart bars (last 14 days via revenueByDate)
const chartBars = computed(() => {
  const data = metrics.value?.revenueByDate ?? []
  if (data.length === 0) { return [] }
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  return data.map(d => ({
    date: d.date,
    revenue: d.revenue,
    heightPct: maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0,
  }))
})

// Status counts for filter badges (from page-local orders)
const statusCounts = computed(() => ({
  PENDING: orders.value.filter(o => o.status === 'PENDING').length,
  COMPLETED: orders.value.filter(o => o.status === 'COMPLETED').length,
  CANCELLED: orders.value.filter(o => o.status === 'CANCELLED').length,
}))

function statCardIconBoxClass(tone: string) {
  const base = 'flex size-10 items-center justify-center rounded-lg border'
  if (tone === 'warning') {
    return `${base} border-warning/20 bg-warning/10 text-warning`
  }
  if (tone === 'success') {
    return `${base} border-success/20 bg-success/10 text-success`
  }
  if (tone === 'primary') {
    return `${base} border-primary/20 bg-primary/10 text-primary`
  }
  if (tone === 'error') {
    return `${base} border-error/20 bg-error/10 text-error`
  }
  return `${base} border-default bg-default/60 text-muted`
}

function truncateId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8" data-testid="backoffice-sales-page">
        <!-- Hero header with optional background image -->
        <div class="relative overflow-hidden rounded-2xl">
          <div v-if="event?.imageUrl" class="absolute inset-0">
            <img :src="event.imageUrl" class="size-full object-cover" alt="">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>
          <div class="relative px-6 py-8 sm:px-8 sm:py-10">
            <UiPageHeading
              eyebrow="Backoffice"
              :title="eventName ? `Ventas — ${eventName}` : 'Reporte de ventas'"
              description="Seguí el estado de las órdenes de tu evento en tiempo real."
              action-label="Volver"
              action-to="/backoffice/events"
            />
          </div>
        </div>

        <!-- KPI Cards (ClientOnly evita el SSR problemático) -->
        <ClientOnly>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <template v-if="metricsLoading">
              <UiPanel v-for="i in 2" :key="'s' + i" class="sm:col-span-3" variant="glass" radius="md" padding="md">
                <BaseSpinner class="mb-4 size-10 rounded-lg" />
                <BaseSpinner class="mb-2 h-8 w-16" />
                <BaseSpinner class="h-4 w-24" />
              </UiPanel>
              <UiPanel v-for="i in 3" :key="'t' + i" class="sm:col-span-2" variant="glass" radius="md" padding="md">
                <BaseSpinner class="mb-4 size-10 rounded-lg" />
                <BaseSpinner class="mb-2 h-8 w-16" />
                <BaseSpinner class="h-4 w-24" />
              </UiPanel>
            </template>

            <template v-else>
              <UiPanel class="sm:col-span-3" variant="glass" radius="md" padding="md">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-3">
                    <UiMetaLabel>Total órdenes</UiMetaLabel>
                    <div class="space-y-1">
                      <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                        {{ totalOrders }}
                      </p>
                      <p class="text-sm text-toned">en este evento</p>
                    </div>
                  </div>
                  <div :class="statCardIconBoxClass('primary')">
                    <BaseIcon name="i-lucide-receipt" class="size-5" />
                  </div>
                </div>
              </UiPanel>

              <UiPanel class="sm:col-span-3" variant="glass" radius="md" padding="md">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-3">
                    <UiMetaLabel>Ingresos confirmados</UiMetaLabel>
                    <div class="space-y-1">
                      <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                        {{ formatAmount(completedRevenue) }}
                      </p>
                      <p class="text-sm text-toned">órdenes completadas</p>
                    </div>
                  </div>
                  <div :class="statCardIconBoxClass('success')">
                    <BaseIcon name="i-lucide-banknote" class="size-5" />
                  </div>
                </div>
              </UiPanel>

              <UiPanel class="sm:col-span-2" variant="glass" radius="md" padding="md">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-3">
                    <UiMetaLabel>Pendientes de pago</UiMetaLabel>
                    <div class="space-y-1">
                      <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                        {{ pendingCount }}
                      </p>
                      <p class="text-sm text-toned">sin confirmar</p>
                    </div>
                  </div>
                  <div :class="statCardIconBoxClass('warning')">
                    <BaseIcon name="i-lucide-clock" class="size-5" />
                  </div>
                </div>
              </UiPanel>

              <UiPanel class="sm:col-span-2" variant="glass" radius="md" padding="md">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-3">
                    <UiMetaLabel>Canceladas</UiMetaLabel>
                    <div class="space-y-1">
                      <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                        {{ cancelledCount }}
                      </p>
                      <p class="text-sm text-toned">no procesadas</p>
                    </div>
                  </div>
                  <div :class="statCardIconBoxClass('error')">
                    <BaseIcon name="i-lucide-ban" class="size-5" />
                  </div>
                </div>
              </UiPanel>

              <UiPanel class="sm:col-span-2" variant="glass" radius="md" padding="md">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-3">
                    <UiMetaLabel>Ticket Promedio</UiMetaLabel>
                    <div class="space-y-1">
                      <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                        {{ formatAmount(avgTicketPrice) }}
                      </p>
                      <p class="text-sm text-toned">por orden completada</p>
                    </div>
                  </div>
                  <div :class="statCardIconBoxClass('primary')">
                    <BaseIcon name="i-lucide-ticket" class="size-5" />
                  </div>
                </div>
              </UiPanel>
            </template>
          </div>
        </ClientOnly>

        <!-- Segmented Order Status Bar -->
        <UiPanel v-if="!metricsLoading && metrics" variant="glass" radius="md" padding="md">
          <div class="mb-3 flex items-center gap-2">
            <BaseIcon name="i-lucide-pie-chart" class="size-4 text-toned" />
            <p class="text-sm font-medium text-highlighted">
              Estado de órdenes
            </p>
          </div>
          <div class="flex h-2 w-full overflow-hidden rounded-full bg-default/30">
            <div
              data-testid="bar-segment-completed"
              class="bg-success transition-all duration-500"
              :style="{ width: `${completedPct}%` }"
            />
            <div
              data-testid="bar-segment-pending"
              class="bg-warning transition-all duration-500"
              :style="{ width: `${pendingPct}%` }"
            />
            <div
              data-testid="bar-segment-cancelled"
              class="bg-error transition-all duration-500"
              :style="{ width: `${cancelledPct}%` }"
            />
          </div>
          <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
            <span class="flex items-center gap-1.5">
              <span class="inline-block size-2 rounded-full bg-success" />
              <span>Completadas: {{ completedCount }}</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="inline-block size-2 rounded-full bg-warning" />
              <span>Pendientes: {{ pendingCount }}</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="inline-block size-2 rounded-full bg-error" />
              <span>Canceladas: {{ cancelledCount }}</span>
            </span>
          </div>
        </UiPanel>

        <!-- Revenue by Ticket Type breakdown -->
        <PagesBackofficeOverviewPanel
          v-if="ticketTypeData.length > 0"
          eyebrow="Ingresos"
          title="Por tipo de entrada"
          description="Comparativa de ingresos según categoría."
          variant="glass"
        >
          <div class="space-y-3">
            <div
              v-for="tt in ticketTypeData"
              :key="tt.name"
              class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 rounded-xl border border-default/60 bg-default/25 px-4 py-3"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="truncate text-sm font-medium text-highlighted">{{ tt.name }}</span>
                <span class="shrink-0 text-sm font-semibold text-success">{{ formatAmount(tt.revenue) }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-muted">
                <BaseIcon name="i-lucide-ticket" class="size-3 shrink-0" />
                <span>{{ tt.sold }} vendidos</span>
              </div>
              <div class="col-span-2 h-1.5 overflow-hidden rounded-full bg-default/30">
                <div
                  data-testid="ticket-type-bar"
                  class="h-full rounded-full bg-success transition-all duration-500"
                  :style="{ width: `${maxTicketRevenue > 0 ? (tt.revenue / maxTicketRevenue) * 100 : 0}%` }"
                />
              </div>
            </div>
          </div>
        </PagesBackofficeOverviewPanel>

        <!-- Revenue Over Time chart -->
        <PagesBackofficeOverviewPanel
          v-if="chartBars.length > 0"
          eyebrow="Tendencia"
          title="Ingresos por día"
          description="Evolución de ingresos en los últimos días."
          variant="glass"
        >
          <div class="flex items-end gap-1 h-28">
            <div
              v-for="bar in chartBars"
              :key="bar.date"
              data-testid="revenue-chart-bar"
              class="flex-1 rounded-t bg-success/50 transition-all duration-500 hover:bg-success/70"
              :style="{ height: `${bar.heightPct}%`, minHeight: '2px' }"
              :title="`${bar.date}: ${formatAmount(bar.revenue)}`"
            />
          </div>
          <div class="mt-2 flex justify-between text-[0.6rem] font-semibold uppercase tracking-widest text-toned/50">
            <span>{{ chartBars.at(0)?.date }}</span>
            <span>{{ chartBars.at(-1)?.date }}</span>
          </div>
        </PagesBackofficeOverviewPanel>

        <!-- Orders list panel -->
        <PagesBackofficeOverviewPanel
          eyebrow="Órdenes"
          title="Listado de órdenes"
          description="Filtrá por estado y navegá entre páginas."
          variant="glass"
        >
          <template #actions>
            <div class="flex items-center gap-3 sm:self-center">
              <div class="flex flex-wrap gap-2">
                <BaseButton
                  v-for="opt in STATUS_OPTIONS"
                  :key="String(opt.value)"
                  variant="outlined"
                  size="sm"
                  class="min-w-0 rounded-full! border-default/45 bg-transparent px-4 py-2.5 text-sm normal-case tracking-normal shadow-none transition-all duration-200"
                  :class="opt.value === statusFilter
                    ? 'border-lavender/45! bg-lavender/14 text-highlighted ring-1 ring-lavender/25 shadow-[inset_0_0_0_1px_rgba(156,125,255,0.16)] hover:bg-lavender/18 hover:ring-lavender/35'
                    : 'text-toned/75 hover:-translate-y-px hover:border-lavender/25 hover:bg-lavender/6 hover:text-highlighted'"
                  @click="setStatusFilter(opt.value)"
                >
                  {{ opt.label }}
                  <span
                    v-if="opt.value !== undefined && !isLoading"
                    class="ml-1 tabular-nums"
                  >
                    ({{ statusCounts[opt.value] }})
                  </span>
                </BaseButton>
              </div>
            </div>
          </template>

          <div class="space-y-3">
            <!-- Loading -->
            <template v-if="isLoading">
              <BaseSpinner v-for="i in 5" :key="i" class="h-20 rounded-xl" />
            </template>

            <!-- Error -->
            <UiEmptyState
              v-else-if="error"
              icon="i-lucide-cloud-off"
              title="Error al cargar órdenes"
              :description="error"
            />

            <!-- Empty -->
            <UiEmptyState
              v-else-if="orders.length === 0"
              icon="i-lucide-receipt"
              title="Sin órdenes"
              description="No hay órdenes que coincidan con los filtros seleccionados."
            />

            <!-- Orders table -->
            <div v-else class="overflow-x-auto rounded-xl border border-default/65">
              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr class="border-b border-default/60 text-left text-xs uppercase tracking-wide text-muted">
                    <th class="px-4 py-3">
                      ID
                    </th>
                    <th class="hidden px-4 py-3 sm:table-cell">
                      Evento
                    </th>
                    <th class="hidden px-4 py-3 md:table-cell">
                      Fecha
                    </th>
                    <th class="px-4 py-3 text-right">
                      Monto
                    </th>
                    <th class="px-4 py-3">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="order in orders"
                    :key="order.id"
                    class="border-b border-default/50 last:border-0"
                  >
                    <td class="px-4 py-3">
                      <span class="font-mono text-xs text-muted">{{ truncateId(order.id) }}</span>
                    </td>
                    <td class="hidden px-4 py-3 sm:table-cell">
                      <span class="text-sm text-highlighted">{{ order.event.name }}</span>
                    </td>
                    <td class="hidden px-4 py-3 md:table-cell">
                      <span class="text-xs text-toned">{{ formatDate(order.createdAt) }}</span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <span class="text-sm font-semibold text-highlighted">{{ formatAmount(order.totalAmount) }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <BaseBadge kind="status" size="xs" :color="statusColor(order.status)">
                        {{ statusLabel(order.status) }}
                      </BaseBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="meta && meta.totalPages > 1" class="flex justify-center pt-2">
              <BasePagination
                :page="page"
                :total="meta.total"
                :items-per-page="20"
                :sibling-count="1"
                size="sm"
                color="neutral"
                variant="ghost"
                active-color="primary"
                active-variant="soft"
                show-edges
                @update:page="setPage"
              />
            </div>
          </div>
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
