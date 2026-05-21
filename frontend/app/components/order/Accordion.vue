<script setup lang="ts">
import type { OrderStatus, PaymentStatus, UserOrder, UserOrderDetail } from '~~/shared/types'

const props = defineProps<{
  order: UserOrder
  forceOpen?: boolean
}>()

const emit = defineEmits<{
  cancelled: [orderId: string]
}>()

const { fetchOrderDetail, cancelMyOrder } = useMyOrders()

const detail = ref<UserOrderDetail | null>(null)
const isLoadingDetail = ref(false)
const isExpanded = ref(props.forceOpen ?? false)
const isCancelling = ref(false)
const cancelError = ref<string | null>(null)

const shouldRenderStatic = computed(() => props.forceOpen ?? false)

async function loadDetail() {
  if (detail.value || isLoadingDetail.value) {
    return
  }

  isLoadingDetail.value = true

  try {
    detail.value = await fetchOrderDetail(props.order.id)
  }
  finally {
    isLoadingDetail.value = false
  }
}

async function handleExpand(val: string | string[] | null) {
  const opened = !!val && (Array.isArray(val) ? val.length > 0 : true)
  isExpanded.value = opened

  if (opened) {
    await loadDetail()
  }
}

const truncatedId = computed(() => props.order.id.slice(0, 8))

const formattedAmount = computed(() =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(props.order.totalAmount),
)

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(props.order.createdAt)),
)

function orderStatusColor(status: OrderStatus): 'success' | 'neutral' | 'error' | 'warning' | 'primary' {
  const map: Record<OrderStatus, 'success' | 'neutral' | 'error' | 'warning' | 'primary'> = {
    PENDING: 'warning',
    PAID: 'success',
    CANCELLED: 'neutral',
    REFUNDED: 'error',
  }
  return map[status]
}

function orderStatusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagada',
    CANCELLED: 'Cancelada',
    REFUNDED: 'Reembolsada',
  }
  return map[status]
}

function orderStatusIcon(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: 'i-lucide-clock',
    PAID: 'i-lucide-circle-check',
    CANCELLED: 'i-lucide-circle-x',
    REFUNDED: 'i-lucide-circle-arrow-left',
  }
  return map[status]
}

function paymentStatusColor(status: PaymentStatus): 'success' | 'neutral' | 'error' | 'warning' {
  const map: Record<PaymentStatus, 'success' | 'neutral' | 'error' | 'warning'> = {
    PENDING: 'warning',
    COMPLETED: 'success',
    FAILED: 'error',
    REFUNDED: 'neutral',
  }
  return map[status]
}

function formattedPaidAt(paidAt: string | null): string {
  if (!paidAt) { return '—' }
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(paidAt))
}

async function handleCancel() {
  // eslint-disable-next-line no-alert
  if (!window.confirm('¿Cancelar esta orden?')) { return }
  isCancelling.value = true
  cancelError.value = null
  try {
    await cancelMyOrder(props.order.id)
    emit('cancelled', props.order.id)
  }
  catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'No se pudo cancelar la orden.'
    cancelError.value = msg
  }
  finally {
    isCancelling.value = false
  }
}

onMounted(() => {
  if (props.forceOpen) {
    void loadDetail()
  }
})
</script>

<template>
  <UiPanel variant="glass" radius="lg" padding="none" class="overflow-hidden border-default/65 transition-all duration-200 hover:border-primary/35 hover:bg-elevated/30">
    <template v-if="shouldRenderStatic">
      <div class="flex flex-col gap-4 px-4 py-4 sm:px-5">
        <div class="flex items-start gap-4">
          <div class="vtx-order-icon flex size-11 shrink-0 items-center justify-center rounded-xl">
            <BaseIcon name="i-lucide-shopping-bag" class="size-5 text-primary" />
          </div>

          <div class="min-w-0 flex-1 space-y-1">
            <p class="text-base font-semibold text-highlighted">
              Orden #{{ truncatedId.toUpperCase() }}
            </p>
            <p class="text-sm text-toned">
              {{ formattedDate }}
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-2">
            <BaseBadge kind="status" size="sm" leading :icon="orderStatusIcon(order.status)" :color="orderStatusColor(order.status)">
              {{ orderStatusLabel(order.status) }}
            </BaseBadge>
            <BaseBadge kind="price" size="sm">
              {{ formattedAmount }}
            </BaseBadge>
          </div>
        </div>
      </div>

      <div class="border-t border-default/65 px-4 py-4 sm:px-5">
        <div v-if="order.status === 'PENDING'" class="mb-4 flex flex-wrap items-center gap-2">
          <BaseButton
            v-if="order.checkoutUrl"
            variant="primary"
            size="sm"
            leading-icon="i-lucide-credit-card"
            :to="order.checkoutUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Completar pago
          </BaseButton>

          <BaseButton
            variant="danger"
            size="sm"
            leading-icon="i-lucide-x-circle"
            :loading="isCancelling"
            :disabled="isCancelling"
            @click="handleCancel"
          >
            Cancelar orden
          </BaseButton>
        </div>

        <p v-if="cancelError" class="mb-3 text-sm text-error">
          {{ cancelError }}
        </p>

        <template v-if="isLoadingDetail">
          <BaseSkeleton class="mb-3 h-24 rounded-lg" />
          <BaseSkeleton class="h-16 rounded-lg" />
        </template>

        <template v-else-if="detail">
          <div class="mb-4 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted">
              Entradas
            </p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-default/65 text-left text-xs text-muted">
                    <th class="pb-2 font-medium">
                      Tipo
                    </th>
                    <th class="pb-2 text-right font-medium">
                      Cant.
                    </th>
                    <th class="pb-2 text-right font-medium">
                      P. Unit.
                    </th>
                    <th class="pb-2 text-right font-medium">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in detail.items"
                    :key="item.id"
                    class="border-b border-default/40 last:border-0"
                  >
                    <td class="py-2 text-toned">
                      {{ item.ticketType.name }}
                    </td>
                    <td class="py-2 text-right text-toned">
                      {{ item.quantity }}
                    </td>
                    <td class="py-2 text-right text-toned">
                      {{ new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.unitPrice) }}
                    </td>
                    <td class="py-2 text-right font-medium text-highlighted">
                      {{ new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.subtotal) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="detail.payments.length > 0" class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted">
              Pagos
            </p>
            <div
              v-for="payment in detail.payments"
              :key="payment.id"
              class="flex items-center gap-3 text-sm"
            >
              <BaseBadge kind="status" size="xs" :color="paymentStatusColor(payment.status)">
                {{ payment.status }}
              </BaseBadge>
              <span class="text-toned capitalize">{{ payment.provider }}</span>
              <span class="ml-auto text-xs text-muted">{{ formattedPaidAt(payment.paidAt) }}</span>
            </div>
          </div>
        </template>
      </div>
    </template>

    <details v-else @toggle="(e) => handleExpand((e.target as HTMLDetailsElement).open ? order.id : null)">
      <summary class="flex cursor-pointer list-none flex-col gap-4 px-4 py-4 sm:px-5 sm:focus-visible:outline-none">
        <div class="flex items-start gap-4">
          <div class="vtx-order-icon flex size-11 shrink-0 items-center justify-center rounded-xl">
            <BaseIcon name="i-lucide-shopping-bag" class="size-5 text-primary" />
          </div>

          <div class="min-w-0 flex-1 space-y-1">
            <p class="text-base font-semibold text-highlighted">
              Orden #{{ truncatedId.toUpperCase() }}
            </p>
            <p class="text-sm text-toned">
              {{ formattedDate }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <BaseBadge kind="status" size="sm" leading :icon="orderStatusIcon(order.status)" :color="orderStatusColor(order.status)">
              {{ orderStatusLabel(order.status) }}
            </BaseBadge>
            <BaseBadge kind="price" size="sm">
              {{ formattedAmount }}
            </BaseBadge>
            <BaseIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-muted transition-transform duration-200 in-[[open]]:rotate-180" />
          </div>
        </div>
      </summary>

      <div class="border-t border-default/65 px-4 py-4 sm:px-5">
        <!-- same expanded content as above -->
        <div v-if="order.status === 'PENDING'" class="mb-4 flex flex-wrap items-center gap-2">
          <BaseButton
            v-if="order.checkoutUrl"
            variant="primary"
            size="sm"
            leading-icon="i-lucide-credit-card"
            :to="order.checkoutUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Completar pago
          </BaseButton>

          <BaseButton
            variant="danger"
            size="sm"
            leading-icon="i-lucide-x-circle"
            :loading="isCancelling"
            :disabled="isCancelling"
            @click="handleCancel"
          >
            Cancelar orden
          </BaseButton>
        </div>

        <p v-if="cancelError" class="mb-3 text-sm text-error">
          {{ cancelError }}
        </p>

        <template v-if="isLoadingDetail">
          <BaseSkeleton class="mb-3 h-24 rounded-lg" />
          <BaseSkeleton class="h-16 rounded-lg" />
        </template>

        <template v-else-if="detail">
          <div class="mb-4 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted">
              Entradas
            </p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-default/65 text-left text-xs text-muted">
                    <th class="pb-2 font-medium">
                      Tipo
                    </th>
                    <th class="pb-2 text-right font-medium">
                      Cant.
                    </th>
                    <th class="pb-2 text-right font-medium">
                      P. Unit.
                    </th>
                    <th class="pb-2 text-right font-medium">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in detail.items"
                    :key="item.id"
                    class="border-b border-default/40 last:border-0"
                  >
                    <td class="py-2 text-toned">
                      {{ item.ticketType.name }}
                    </td>
                    <td class="py-2 text-right text-toned">
                      {{ item.quantity }}
                    </td>
                    <td class="py-2 text-right text-toned">
                      {{ new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.unitPrice) }}
                    </td>
                    <td class="py-2 text-right font-medium text-highlighted">
                      {{ new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.subtotal) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="detail.payments.length > 0" class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted">
              Pagos
            </p>
            <div
              v-for="payment in detail.payments"
              :key="payment.id"
              class="flex items-center gap-3 text-sm"
            >
              <BaseBadge kind="status" size="xs" :color="paymentStatusColor(payment.status)">
                {{ payment.status }}
              </BaseBadge>
              <span class="text-toned capitalize">{{ payment.provider }}</span>
              <span class="ml-auto text-xs text-muted">{{ formattedPaidAt(payment.paidAt) }}</span>
            </div>
          </div>
        </template>
      </div>
    </details>
  </UiPanel>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-order-icon {
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}
</style>
