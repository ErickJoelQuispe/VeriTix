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

const selectedStatus = computed({
  get: () => STATUS_OPTIONS.find(opt => opt.value === statusFilter.value) ?? STATUS_OPTIONS[0]!,
  set: (opt) => { setStatusFilter(opt.value) },
})

const isDropdownOpen = ref(false)

function selectStatus(opt: (typeof STATUS_OPTIONS)[number]) {
  isDropdownOpen.value = false
  setStatusFilter(opt.value)
}

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
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <UiPageHeading
            eyebrow="Backoffice"
            title="Reporte de ventas"
            description="Listado paginado y filtrable de órdenes para este evento."
          />
          <BaseButton
            to="/backoffice/events"
            variant="outlined"
            size="sm"
            leading-icon="i-lucide-arrow-left"
          >
            Volver a eventos
          </BaseButton>
        </div>

        <!-- Filters -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <button
              type="button"
              class="inline-flex h-10 items-center gap-2 rounded-xl border border-default/65 bg-elevated/55 px-4 text-sm text-highlighted shadow-sm transition-colors hover:border-default/90"
              @click="isDropdownOpen = !isDropdownOpen"
            >
              <BaseIcon name="i-lucide-filter" class="size-4 text-muted" />
              {{ selectedStatus.label }}
              <BaseIcon name="i-lucide-chevron-down" class="size-4 text-muted" :class="{ 'rotate-180': isDropdownOpen }" />
            </button>

            <div
              v-if="isDropdownOpen"
              class="absolute left-0 top-full z-10 mt-1 min-w-40 overflow-hidden rounded-xl border border-default/65 bg-elevated shadow-lg"
            >
              <button
                v-for="opt in STATUS_OPTIONS"
                :key="String(opt.value)"
                type="button"
                class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-default/40"
                :class="opt.value === statusFilter ? 'text-highlighted font-medium' : 'text-toned'"
                @click="selectStatus(opt)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="space-y-3">
          <BaseSkeleton v-for="i in 5" :key="i" class="h-14 rounded-xl" />
        </div>

        <!-- Error -->
        <div
          v-else-if="error"
          class="rounded-2xl border border-error/30 bg-error/8 px-6 py-10 text-center"
        >
          <div class="mx-auto flex max-w-md flex-col items-center gap-4">
            <BaseIcon name="i-lucide-cloud-off" class="size-8 text-error" />
            <p class="text-sm leading-relaxed text-toned">
              {{ error }}
            </p>
          </div>
        </div>

        <!-- Empty -->
        <UiEmptyState
          v-else-if="orders.length === 0"
          icon="i-lucide-shopping-bag"
          title="Sin órdenes"
          description="No hay órdenes que coincidan con los filtros seleccionados."
        />

        <!-- Table -->
        <div v-else class="overflow-hidden rounded-xl border border-default/65">
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-sm">
              <thead>
                <tr class="border-b border-default/60 text-left text-xs tracking-wide text-muted uppercase">
                  <th class="px-4 py-3">
                    ID
                  </th>
                  <th class="px-4 py-3">
                    Estado
                  </th>
                  <th class="px-4 py-3 text-right">
                    Monto
                  </th>
                  <th class="px-4 py-3">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="order in orders"
                  :key="order.id"
                  class="border-b border-default/50 last:border-0"
                >
                  <td class="px-4 py-3 font-mono text-toned">
                    {{ order.id.slice(0, 8) }}
                  </td>
                  <td class="px-4 py-3">
                    <BaseBadge kind="status" size="xs" :color="statusColor(order.status)">
                      {{ statusLabel(order.status) }}
                    </BaseBadge>
                  </td>
                  <td class="px-4 py-3 text-right font-semibold text-highlighted">
                    {{ formatAmount(order.totalAmount) }}
                  </td>
                  <td class="px-4 py-3 text-toned">
                    {{ formatDate(order.createdAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="meta && meta.totalPages > 1" class="flex justify-center">
          <BasePagination
            :page="page"
            :total="meta.total"
            :items-per-page="20"
            show-edges
            @update:page="setPage"
          />
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
