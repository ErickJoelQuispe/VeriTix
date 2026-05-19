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
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Reporte de ventas"
          description="Listado paginado y filtrable de órdenes para este evento."
          action-label="Volver"
          action-to="/backoffice/events"
        />

        <PagesBackofficeOverviewPanel
          eyebrow="Filtros"
          title="Órdenes del evento"
          description="Filtrá por estado y paginá los resultados."
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
                  class="rounded-full!"
                  :class="opt.value === statusFilter
                    ? 'border-lavender/45! bg-lavender/14 text-highlighted ring-1 ring-lavender/25'
                    : 'border-default/45 text-toned/75'"
                  @click="setStatusFilter(opt.value)"
                >
                  {{ opt.label }}
                </BaseButton>
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Loading -->
            <template v-if="isLoading">
              <BaseSkeleton v-for="i in 5" :key="i" class="h-14 rounded-xl" />
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

            <!-- Orders list -->
            <template v-else>
              <UiPanel
                v-for="order in orders"
                :key="order.id"
                variant="glass"
                padding="md"
                radius="lg"
                class="flex flex-row items-center gap-3 border-default/65! bg-elevated/25!"
              >
                <div class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
                  <div class="min-w-0 space-y-1">
                    <p class="font-mono text-sm text-toned">
                      #{{ order.id.slice(0, 8) }}
                    </p>
                    <p class="text-xs text-muted">
                      {{ formatDate(order.createdAt) }}
                    </p>
                  </div>

                  <div class="flex items-center gap-3">
                    <p class="text-sm font-semibold text-highlighted">
                      {{ formatAmount(order.totalAmount) }}
                    </p>
                    <BaseBadge kind="status" size="xs" :color="statusColor(order.status)">
                      {{ statusLabel(order.status) }}
                    </BaseBadge>
                  </div>
                </div>
              </UiPanel>
            </template>

            <!-- Pagination -->
            <div v-if="meta && meta.totalPages > 1" class="flex justify-center pt-1 pb-1">
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
