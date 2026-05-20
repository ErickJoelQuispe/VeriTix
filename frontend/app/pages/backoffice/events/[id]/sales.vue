<script setup lang="ts">
import type { EventOrderStatus } from '~~/shared/api/orders'

definePageMeta({ layout: 'backoffice', middleware: 'sales-report' })
useSeoMeta({ title: 'Reporte de ventas | Backoffice VeriTix' })

const route = useRoute()
const eventId = computed(() => String(route.params.id || ''))

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

// Nombre del evento (disponible una vez que cargan las órdenes)
const eventName = computed(() => orders.value[0]?.event.name ?? '')

// Métricas derivadas de las órdenes de la página actual + meta total
const totalOrders = computed(() => meta.value?.total ?? 0)

const completedRevenue = computed(() =>
  orders.value
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalAmount, 0),
)

const pendingCount = computed(() =>
  orders.value.filter(o => o.status === 'PENDING').length,
)

const cancelledCount = computed(() =>
  orders.value.filter(o => o.status === 'CANCELLED').length,
)

// Tasa de conversión (COMPLETED / total de la página)
const conversionRate = computed(() => {
  if (orders.value.length === 0) { return 0 }
  const completed = orders.value.filter(o => o.status === 'COMPLETED').length
  return Math.round((completed / orders.value.length) * 100)
})

// Conteos para labels de filtro
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
        <UiPageHeading
          eyebrow="Backoffice"
          :title="eventName ? `Ventas — ${eventName}` : 'Reporte de ventas'"
          description="Seguí el estado de las órdenes de tu evento en tiempo real."
          action-label="Volver"
          action-to="/backoffice/events"
        />

        <!-- KPI Cards — igual que dashboard/index.vue, sueltos sin wrapper -->
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <template v-if="isLoading">
            <UiPanel v-for="i in 4" :key="i" variant="glass" radius="md" padding="md">
              <BaseSkeleton class="mb-4 size-10 rounded-lg" />
              <BaseSkeleton class="mb-2 h-8 w-16" />
              <BaseSkeleton class="h-4 w-24" />
            </UiPanel>
          </template>

          <template v-else>
            <UiPanel variant="glass" radius="md" padding="md">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-3">
                  <UiMetaLabel>Total órdenes</UiMetaLabel>
                  <div class="space-y-1">
                    <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                      {{ totalOrders }}
                    </p>
                    <p class="text-sm text-toned">
                      en este evento
                    </p>
                  </div>
                </div>
                <div :class="statCardIconBoxClass('primary')">
                  <BaseIcon name="i-lucide-receipt" class="size-5" />
                </div>
              </div>
            </UiPanel>

            <UiPanel variant="glass" radius="md" padding="md">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-3">
                  <UiMetaLabel>Ingresos confirmados</UiMetaLabel>
                  <div class="space-y-1">
                    <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                      {{ formatAmount(completedRevenue) }}
                    </p>
                    <p class="text-sm text-toned">
                      órdenes completadas
                    </p>
                  </div>
                </div>
                <div :class="statCardIconBoxClass('success')">
                  <BaseIcon name="i-lucide-banknote" class="size-5" />
                </div>
              </div>
            </UiPanel>

            <UiPanel variant="glass" radius="md" padding="md">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-3">
                  <UiMetaLabel>Pendientes de pago</UiMetaLabel>
                  <div class="space-y-1">
                    <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                      {{ pendingCount }}
                    </p>
                    <p class="text-sm text-toned">
                      sin confirmar
                    </p>
                  </div>
                </div>
                <div :class="statCardIconBoxClass('warning')">
                  <BaseIcon name="i-lucide-clock" class="size-5" />
                </div>
              </div>
            </UiPanel>

            <UiPanel variant="glass" radius="md" padding="md">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-3">
                  <UiMetaLabel>Canceladas</UiMetaLabel>
                  <div class="space-y-1">
                    <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                      {{ cancelledCount }}
                    </p>
                    <p class="text-sm text-toned">
                      no procesadas
                    </p>
                  </div>
                </div>
                <div :class="statCardIconBoxClass('error')">
                  <BaseIcon name="i-lucide-ban" class="size-5" />
                </div>
              </div>
            </UiPanel>
          </template>
        </div>

        <!-- Barra de conversión -->
        <div v-if="!isLoading && orders.length > 0" class="rounded-xl border border-default/60 bg-default/25 px-5 py-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <BaseIcon name="i-lucide-trending-up" class="size-4 text-success" />
              <p class="text-sm font-medium text-highlighted">
                Tasa de conversión
              </p>
            </div>
            <p class="text-sm font-semibold tabular-nums text-success">
              {{ conversionRate }}%
            </p>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-default/30">
            <div
              class="h-full rounded-full bg-success transition-all duration-500"
              :style="{ width: `${conversionRate}%` }"
            />
          </div>
          <div class="mt-2 flex justify-between text-xs text-muted">
            <span>{{ statusCounts.COMPLETED }} completadas</span>
            <span>{{ orders.length }} en esta página</span>
          </div>
        </div>

        <!-- Orders list panel separado -->
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
              <BaseSkeleton v-for="i in 5" :key="i" class="h-20 rounded-xl" />
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

            <!-- Orders -->
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
