<script setup lang="ts">
import type { UserOrder } from '~~/shared/types'

defineProps<{
  orders: UserOrder[]
  isLoading: boolean
}>()
</script>

<template>
  <div class="space-y-3">
    <!-- Loading skeletons -->
    <template v-if="isLoading">
      <BaseSkeleton v-for="i in 3" :key="i" class="h-16 rounded-xl" />
    </template>

    <!-- Empty state -->
    <template v-else-if="orders.length === 0">
      <UiEmptyState
        icon="i-lucide-receipt-x"
        title="Sin órdenes para este evento"
        description="No tenés órdenes registradas para este evento."
      />
    </template>

    <!-- Order accordions -->
    <template v-else>
      <OrderAccordion
        v-for="order in orders"
        :key="order.id"
        :order="order"
      />
    </template>
  </div>
</template>
