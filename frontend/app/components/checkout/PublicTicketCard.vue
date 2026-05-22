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
    <!-- Loading indicators -->
    <template v-if="loading">
      <div v-for="n in 3" :key="n" class="rounded-2xl border border-default/55 bg-elevated/20 p-5">
        <div class="flex items-start gap-6">
          <div class="flex-1 space-y-3">
            <BaseSpinner class="h-6 w-40 rounded-full" />
            <BaseSpinner class="h-4 w-64 rounded-full" />
            <BaseSpinner class="h-3 w-36 rounded-full" />
          </div>
          <div class="shrink-0 space-y-2 text-right">
            <BaseSpinner class="ml-auto h-7 w-24 rounded-full" />
            <BaseSpinner class="ml-auto h-3 w-20 rounded-full" />
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between gap-4 rounded-xl bg-default/8 p-3">
          <BaseSpinner class="h-4 w-20 rounded-full" />
          <div class="flex items-center gap-3">
            <BaseSpinner class="size-8 rounded-lg" />
            <BaseSpinner class="h-5 w-6 rounded-full" />
            <BaseSpinner class="size-8 rounded-lg" />
          </div>
        </div>
      </div>
    </template>

    <!-- Ticket cards -->
    <template v-else>
      <div
        v-for="tt in ticketTypes"
        :key="tt.id"
        class="group relative overflow-hidden rounded-2xl border transition-all duration-300"
        :class="isSoldOut(tt)
          ? 'border-default/30 bg-default/8 opacity-65 saturate-0'
          : getQuantity(tt.id) > 0
            ? 'border-lavender/55 bg-lavender/8 shadow-[0_0_0_1px_rgba(170,137,255,0.22)]'
            : 'border-default/55 bg-elevated/25 backdrop-blur-sm hover:border-lavender/30 hover:bg-elevated/35'"
      >
        <!-- Left accent bar (ticket stub feel) -->
        <div
          class="absolute inset-y-0 left-0 w-1 rounded-l-full"
          :class="isSoldOut(tt) ? 'bg-default/35' : getQuantity(tt.id) > 0 ? 'bg-lavender' : 'bg-lavender/50'"
        />

        <div class="p-5 sm:p-6">
          <div class="flex items-start gap-6">
            <!-- Left: ticket info -->
            <div class="min-w-0 flex-1 space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-lg font-bold text-highlighted sm:text-xl">
                  {{ tt.name }}
                </p>
                <BaseBadge v-if="getQuantity(tt.id) > 0 && !isSoldOut(tt)" kind="status" color="primary" size="xs">
                  Seleccionada
                </BaseBadge>
                <BaseBadge v-if="isSoldOut(tt)" kind="status" color="error" size="xs">
                  Agotado
                </BaseBadge>
              </div>

              <p v-if="tt.description" class="text-sm leading-relaxed text-toned">
                {{ tt.description }}
              </p>

              <p class="text-xs font-medium text-muted">
                {{ tt.availableQuantity.toLocaleString('es-ES') }} disponibles de {{ tt.totalQuantity.toLocaleString('es-ES') }}
                <span v-if="maxQuantity(tt) < tt.availableQuantity" class="ml-1">
                  · Máx. {{ maxQuantity(tt) }} por compra
                </span>
              </p>
            </div>

            <!-- Right: price -->
            <div class="shrink-0 text-right">
              <p class="text-xl font-bold text-highlighted tabular-nums sm:text-2xl">
                {{ formatCurrencyAmount(tt.price, props.currency) }}
              </p>
              <p class="text-xs font-medium text-toned">
                por entrada
              </p>
            </div>
          </div>

          <!-- Stepper (or sold-out message) -->
          <div v-if="!isSoldOut(tt)" class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                Cantidad
              </p>
            </div>

            <div
              class="flex items-center gap-1 rounded-xl border px-1 py-1"
              :class="getQuantity(tt.id) > 0
                ? 'border-lavender/35 bg-lavender/8'
                : 'border-default/35 bg-transparent'"
            >
              <button
                :data-testid="`decrement-${tt.id}`"
                type="button"
                class="flex size-11 cursor-pointer items-center justify-center rounded-lg text-lg font-semibold text-highlighted transition-colors hover:bg-default/20 disabled:cursor-not-allowed disabled:opacity-30"
                :disabled="getQuantity(tt.id) === 0"
                @click="decrement(tt)"
              >
                −
              </button>

              <span
                class="w-10 rounded-md px-2 py-1 text-center text-base font-semibold tabular-nums"
                :class="getQuantity(tt.id) > 0 ? 'bg-lavender/20 text-highlighted' : 'text-highlighted'"
              >
                {{ getQuantity(tt.id) }}
              </span>

              <button
                :data-testid="`increment-${tt.id}`"
                type="button"
                class="flex size-11 cursor-pointer items-center justify-center rounded-lg text-lg font-semibold text-highlighted transition-colors hover:bg-default/20 disabled:cursor-not-allowed disabled:opacity-30"
                :disabled="getQuantity(tt.id) >= maxQuantity(tt)"
                @click="increment(tt)"
              >
                +
              </button>
            </div>
          </div>

          <div v-else class="flex items-center justify-center py-2">
            <p class="text-sm font-medium text-muted">
              No hay entradas disponibles para este tipo.
            </p>
          </div>
        </div>
      </div>

      <!-- Total row -->
      <div
        v-if="ticketTypes.length > 0"
        class="flex items-center justify-between pt-3"
      >
        <p class="text-sm font-semibold text-highlighted">
          Total
        </p>
        <div class="text-right">
          <p class="text-xl font-bold text-highlighted tabular-nums">
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
