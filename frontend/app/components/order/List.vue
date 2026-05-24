<script setup lang="ts">
import type { UserOrder } from '~~/shared/types'

const props = defineProps<{
  orders: UserOrder[]
  isLoading: boolean
}>()

const localOrders = ref(props.orders.map(o => ({ ...o })))

watch(() => props.orders, (val) => {
  localOrders.value = val.map(o => ({ ...o }))
}, { deep: true })

function handleCancelled(orderId: string) {
  const order = localOrders.value.find(o => o.id === orderId)
  if (order) { order.status = 'CANCELLED' }
}
</script>

<template>
  <div class="space-y-3">
    <!-- Loading indicators -->
    <template v-if="isLoading">
      <div class="flex min-h-24 items-center justify-center">
        <BaseSpinner class="size-10" spinner-class="size-10" />
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="localOrders.length === 0">
      <UiEmptyState
        icon="i-lucide-receipt-text"
        title="Sin órdenes para este evento"
        description="No tenés órdenes registradas para este evento."
      />
    </template>

    <!-- Order accordions -->
    <template v-else>
      <OrderAccordion
        v-for="order in localOrders"
        :key="order.id"
        :order="order"
        :force-open="localOrders.length === 1"
        @cancelled="handleCancelled"
      />
    </template>
  </div>
</template>
