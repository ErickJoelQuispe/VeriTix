<script setup lang="ts">
import type { TicketStatus, UserTicket } from '~~/shared/types'

defineProps<{
  tickets: UserTicket[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  openTicket: [ticket: UserTicket]
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

function statusIcon(status: TicketStatus): string {
  const map: Record<TicketStatus, string> = {
    ACTIVE: 'i-lucide-circle-check',
    USED: 'i-lucide-check-check',
    CANCELLED: 'i-lucide-circle-x',
    REFUNDED: 'i-lucide-circle-arrow-left',
  }
  return map[status]
}

const truncatedId = (id: string) => id.replace(/-/g, '').slice(0, 8)

function formattedPrice(price: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price)
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
        radius="lg"
        padding="md"
        class="border-default/65 transition-all duration-200 hover:border-primary/35 hover:bg-elevated/35"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0 flex items-start gap-4">
            <div class="vtx-ticket-icon flex size-11 shrink-0 items-center justify-center rounded-xl">
              <BaseIcon name="i-lucide-ticket" class="size-5 text-primary" />
            </div>

            <div class="min-w-0 space-y-1">
              <p class="truncate text-base font-semibold text-highlighted">
                {{ ticket.ticketType.name }}
              </p>
              <p class="font-mono text-xs text-muted">
                #{{ truncatedId(ticket.id).toUpperCase() }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:justify-end">
            <div class="flex items-center gap-2">
              <BaseBadge
                kind="status"
                size="sm"
                leading
                :icon="statusIcon(ticket.status)"
                :color="statusBadgeColor(ticket.status)"
              >
                {{ statusBadgeLabel(ticket.status) }}
              </BaseBadge>

              <BaseBadge kind="price" size="sm">
                {{ formattedPrice(ticket.ticketType.price) }}
              </BaseBadge>
            </div>

            <BaseButton
              variant="outlined"
              size="sm"
              trailing-icon="i-lucide-arrow-right"
              @click="emit('openTicket', ticket)"
            >
              Ver ticket
            </BaseButton>
          </div>
        </div>
      </UiPanel>
    </template>
  </div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-ticket-icon {
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}
</style>
