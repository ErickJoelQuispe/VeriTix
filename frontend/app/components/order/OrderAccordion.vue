<script setup lang="ts">
import type { UserOrder, UserOrderDetail, OrderStatus, PaymentStatus } from '~~/shared/types'

const props = defineProps<{
  order: UserOrder
}>()

const { fetchOrderDetail } = useMyOrders()

const detail = ref<UserOrderDetail | null>(null)
const isLoadingDetail = ref(false)
const isExpanded = ref(false)

async function handleExpand(val: string | string[] | null) {
  const opened = !!val && (Array.isArray(val) ? val.length > 0 : true)
  isExpanded.value = opened

  if (opened && !detail.value) {
    isLoadingDetail.value = true
    try {
      detail.value = await fetchOrderDetail(props.order.id)
    }
    finally {
      isLoadingDetail.value = false
    }
  }
}

const truncatedId = computed(() => props.order.id.slice(0, 8))

const formattedAmount = computed(() =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(props.order.totalAmount),
)

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(props.order.createdAt)),
)

const orderStatusColor = (status: OrderStatus): 'success' | 'neutral' | 'error' | 'warning' | 'primary' => {
  const map: Record<OrderStatus, 'success' | 'neutral' | 'error' | 'warning' | 'primary'> = {
    PENDING: 'warning',
    PAID: 'success',
    CANCELLED: 'neutral',
    REFUNDED: 'error',
    EXPIRED: 'neutral',
  }
  return map[status]
}

const orderStatusLabel = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagada',
    CANCELLED: 'Cancelada',
    REFUNDED: 'Reembolsada',
    EXPIRED: 'Expirada',
  }
  return map[status]
}

const paymentStatusColor = (status: PaymentStatus): 'success' | 'neutral' | 'error' | 'warning' => {
  const map: Record<PaymentStatus, 'success' | 'neutral' | 'error' | 'warning'> = {
    PENDING: 'warning',
    PAID: 'success',
    FAILED: 'error',
    REFUNDED: 'neutral',
  }
  return map[status]
}

const formattedPaidAt = (paidAt: string | null): string => {
  if (!paidAt) return '—'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(paidAt))
}

// Build UAccordion items array — header label is the order summary
const accordionItems = computed(() => [
  {
    value: props.order.id,
    label: `Orden #${truncatedId.value}`,
  },
])
</script>

<template>
  <UiPanel variant="glass" radius="xl" padding="none" class="overflow-hidden">
    <!-- Custom accordion trigger row -->
    <details @toggle="(e) => handleExpand((e.target as HTMLDetailsElement).open ? order.id : null)">
      <summary class="flex cursor-pointer list-none items-center gap-3 px-4 py-3 sm:px-5">
        <BaseBadge kind="status" size="sm" :color="orderStatusColor(order.status)">
          {{ orderStatusLabel(order.status) }}
        </BaseBadge>

        <span class="min-w-0 flex-1 font-mono text-sm text-toned">
          Orden #{{ truncatedId }}
        </span>

        <span class="shrink-0 text-sm font-semibold text-highlighted">
          {{ formattedAmount }}
        </span>

        <span class="shrink-0 text-xs text-muted">
          {{ formattedDate }}
        </span>

        <BaseIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-muted transition-transform duration-200 [[open]_&]:rotate-180" />
      </summary>

      <!-- Expanded content -->
      <div class="border-t border-default/65 px-4 py-4 sm:px-5">
        <!-- Complete payment CTA (PENDING with checkout URL) -->
        <div v-if="order.status === 'PENDING' && order.checkoutUrl" class="mb-4">
          <BaseButton
            variant="primary"
            size="sm"
            leading-icon="i-lucide-credit-card"
            :to="order.checkoutUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Completar pago
          </BaseButton>
        </div>

        <!-- Loading detail -->
        <template v-if="isLoadingDetail">
          <BaseSkeleton class="mb-3 h-24 rounded-lg" />
          <BaseSkeleton class="h-16 rounded-lg" />
        </template>

        <template v-else-if="detail">
          <!-- Items table -->
          <div class="mb-4 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-muted">
              Entradas
            </p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-default/65 text-left text-xs text-muted">
                    <th class="pb-2 font-medium">Tipo</th>
                    <th class="pb-2 text-right font-medium">Cant.</th>
                    <th class="pb-2 text-right font-medium">P. Unit.</th>
                    <th class="pb-2 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in detail.items"
                    :key="item.id"
                    class="border-b border-default/40 last:border-0"
                  >
                    <td class="py-2 text-toned">{{ item.ticketType.name }}</td>
                    <td class="py-2 text-right text-toned">{{ item.quantity }}</td>
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

          <!-- Payments -->
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
