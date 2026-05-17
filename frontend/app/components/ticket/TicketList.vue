<script setup lang="ts">
import type { TicketStatus, UserTicket } from '~~/shared/types'

defineProps<{
  tickets: UserTicket[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  'open-ticket': [ticket: UserTicket]
}>()

function statusBadgeColor(status: TicketStatus): 'success' | 'neutral' | 'error' | 'warning' {
  const map: Record<TicketStatus, 'success' | 'neutral' | 'error' | 'warning'> = {
    ACTIVE: 'success',
    USED: 'neutral',
    CANCELLED: 'error',
    REFUNDED: 'warning',
  }
  return map[status]
}

function statusBadgeLabel(status: TicketStatus): string {
  const map: Record<TicketStatus, string> = {
    ACTIVE: 'Activo',
    USED: 'Usado',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
  }
  return map[status]
}

const truncatedHash = (hash: string) => hash.slice(0, 8)

function formattedPrice(price: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price)
}
</script>

<template>
  <div class="space-y-3">
    <!-- Loading skeletons -->
    <template v-if="isLoading">
      <BaseSkeleton v-for="i in 3" :key="i" class="h-16 rounded-xl" />
    </template>

    <!-- Empty state -->
    <template v-else-if="tickets.length === 0">
      <UiEmptyState
        icon="i-lucide-ticket-x"
        title="Sin entradas para este evento"
        description="No tenés entradas registradas para este evento."
      />
    </template>

    <!-- Ticket rows -->
    <template v-else>
      <UiPanel
        v-for="ticket in tickets"
        :key="ticket.id"
        variant="glass"
        radius="xl"
        padding="none"
        class="flex items-center gap-4 px-4 py-3 sm:px-5"
      >
        <BaseBadge kind="status" size="sm" :color="statusBadgeColor(ticket.status)">
          {{ statusBadgeLabel(ticket.status) }}
        </BaseBadge>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-highlighted">
            {{ ticket.ticketType.name }}
          </p>
          <p class="font-mono text-xs text-muted">
            #{{ truncatedHash(ticket.hash) }}
          </p>
        </div>

        <p class="shrink-0 text-sm font-semibold text-highlighted">
          {{ formattedPrice(ticket.ticketType.price) }}
        </p>

        <BaseButton
          variant="outlined"
          size="xs"
          trailing-icon="i-lucide-arrow-right"
          @click="emit('open-ticket', ticket)"
        >
          Ver QR
        </BaseButton>
      </UiPanel>
    </template>
  </div>
</template>
