<script setup lang="ts">
import type { TicketType } from '~~/shared/types/domain'
import { formatCurrencyAmount } from '@/utils/currency-formatters'

const props = withDefaults(defineProps<{
  ticketTypes: TicketType[]
  loading: boolean
  currency?: string
}>(), {
  currency: 'EUR',
})

const emit = defineEmits<{
  'update:selection': [items: Array<{ ticketTypeId: string, quantity: number, unitPrice: number }>]
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
  const selection: Array<{ ticketTypeId: string, quantity: number, unitPrice: number }> = []
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
</script>

<template>
  <div class="space-y-4">
    <template v-if="loading">
      <div v-for="n in 3" :key="n" data-testid="ticket-type-skeleton" class="space-y-3 rounded-2xl border border-default/55 bg-elevated/20 p-4">
        <div class="flex items-start justify-between gap-4">
          <BaseSkeleton class="h-5 w-32 rounded-full" />
          <BaseSkeleton class="h-6 w-24 rounded-full" />
        </div>
        <BaseSkeleton class="h-3 w-3/4 rounded-full" />
        <BaseSkeleton class="h-3 w-24 rounded-full" />
      </div>
    </template>

    <template v-else>
      <div
        v-for="tt in ticketTypes"
        :key="tt.id"
        class="space-y-4 rounded-2xl border px-4 py-4 transition-colors"
        :class="isSoldOut(tt)
          ? 'border-default/40 bg-elevated/15 opacity-60'
          : 'border-default/55 bg-elevated/25'"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-semibold text-highlighted">
                {{ tt.name }}
              </p>
              <BaseBadge v-if="isSoldOut(tt)" kind="status" color="error" size="xs">
                Agotado
              </BaseBadge>
              <BaseBadge v-else kind="status" color="success" size="xs">
                Disponible
              </BaseBadge>
            </div>

            <p v-if="tt.description" class="text-sm leading-relaxed text-toned">
              {{ tt.description }}
            </p>

            <p class="text-xs text-muted">
              {{ tt.availableQuantity }} disponibles · Máx. {{ maxQuantity(tt) }} por compra
            </p>
          </div>

          <div class="shrink-0 text-right">
            <p class="text-lg font-semibold text-highlighted tabular-nums">
              {{ formatCurrencyAmount(tt.price, props.currency) }}
            </p>
            <p class="text-xs text-toned">
              Precio por entrada
            </p>
          </div>
        </div>

        <div v-if="!isSoldOut(tt)" class="flex items-center justify-between gap-3 rounded-xl border border-default/40 bg-default/10 px-3 py-2">
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Cantidad
            </p>
            <p class="text-sm text-toned">
              Seleccioná cuántas querés agregar.
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-2">
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
      </div>

      <div
        v-if="ticketTypes.length > 0"
        class="flex items-center justify-between rounded-2xl border border-default/55 bg-elevated/30 px-4 py-3"
      >
        <p class="text-sm font-medium text-toned">
          Total
        </p>
        <div class="text-right">
          <p class="text-lg font-semibold text-highlighted tabular-nums">
            {{ formatCurrencyAmount(total, props.currency) }}
          </p>
          <p class="text-xs text-toned">
            Antes de impuestos o cargos de pago.
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
