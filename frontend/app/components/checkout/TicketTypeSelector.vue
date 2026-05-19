<script setup lang="ts">
import type { TicketType } from '~~/shared/types/domain'

const props = defineProps<{
  ticketTypes: TicketType[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:selection': [items: Array<{ ticketTypeId: string; quantity: number; unitPrice: number }>]
}>()

const quantities = reactive<Map<string, number>>(new Map())

function maxQuantity(tt: TicketType): number {
  return Math.min(tt.maxPerUser, tt.availableQuantity)
}

function isSoldOut(tt: TicketType): boolean {
  return !tt.isActive || tt.availableQuantity === 0
}

function getQuantity(id: string): number {
  return quantities.get(id) ?? 0
}

function emitSelection(): void {
  const selection: Array<{ ticketTypeId: string; quantity: number; unitPrice: number }> = []
  for (const tt of props.ticketTypes) {
    const qty = getQuantity(tt.id)
    if (qty > 0) {
      selection.push({ ticketTypeId: tt.id, quantity: qty, unitPrice: tt.price })
    }
  }
  emit('update:selection', selection)
}

function increment(tt: TicketType): void {
  const current = getQuantity(tt.id)
  const max = maxQuantity(tt)
  if (current < max) {
    quantities.set(tt.id, current + 1)
    emitSelection()
  }
}

function decrement(tt: TicketType): void {
  const current = getQuantity(tt.id)
  if (current > 0) {
    quantities.set(tt.id, current - 1)
    emitSelection()
  }
}

const total = computed<number>(() => {
  let sum = 0
  for (const tt of props.ticketTypes) {
    sum += getQuantity(tt.id) * tt.price
  }
  return sum
})

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Loading skeletons -->
    <template v-if="loading">
      <div
        v-for="n in 3"
        :key="n"
        data-testid="ticket-type-skeleton"
        class="h-20 animate-pulse rounded-2xl bg-elevated/40"
      />
    </template>

    <!-- Ticket types list -->
    <template v-else>
      <div
        v-for="tt in ticketTypes"
        :key="tt.id"
        class="flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-colors"
        :class="isSoldOut(tt)
          ? 'border-default/40 bg-elevated/15 opacity-60'
          : 'border-default/55 bg-elevated/25'"
      >
        <!-- Ticket info -->
        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-semibold text-highlighted">
              {{ tt.name }}
            </p>
            <span
              v-if="isSoldOut(tt)"
              class="rounded px-2 py-0.5 text-xs font-semibold bg-error/20 text-error"
            >
              Agotado
            </span>
          </div>
          <p class="text-sm font-medium text-toned">
            ${{ formatPrice(tt.price) }}
          </p>
          <p v-if="tt.description" class="text-xs text-muted">
            {{ tt.description }}
          </p>
          <p class="text-xs text-muted">
            {{ tt.availableQuantity }} disponibles
          </p>
        </div>

        <!-- Quantity stepper -->
        <div v-if="!isSoldOut(tt)" class="flex shrink-0 items-center gap-2">
          <button
            :data-testid="`decrement-${tt.id}`"
            type="button"
            class="flex size-8 items-center justify-center rounded-lg border border-default/55 bg-elevated/40 text-sm font-semibold text-highlighted transition-colors hover:bg-elevated/60 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="getQuantity(tt.id) === 0"
            @click="decrement(tt)"
          >
            −
          </button>

          <span class="w-6 text-center text-sm font-semibold text-highlighted tabular-nums">
            {{ getQuantity(tt.id) }}
          </span>

          <button
            :data-testid="`increment-${tt.id}`"
            type="button"
            class="flex size-8 items-center justify-center rounded-lg border border-default/55 bg-elevated/40 text-sm font-semibold text-highlighted transition-colors hover:bg-elevated/60 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="getQuantity(tt.id) >= maxQuantity(tt)"
            @click="increment(tt)"
          >
            +
          </button>
        </div>
      </div>

      <!-- Total -->
      <div
        v-if="ticketTypes.length > 0"
        class="flex items-center justify-between rounded-2xl border border-default/55 bg-elevated/30 px-4 py-3"
      >
        <p class="text-sm font-medium text-toned">
          Total
        </p>
        <p class="text-lg font-semibold text-highlighted tabular-nums">
          ${{ formatPrice(total) }}
        </p>
      </div>
    </template>
  </div>
</template>
