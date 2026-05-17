<script setup lang="ts">
import type { PaginationMeta } from '~~/shared/api/types'
import type { UserTicket } from '~~/shared/types'
import { formatEventDate } from '@/utils/date-formatters'

definePageMeta({
  layout: 'account',
  middleware: 'auth',
})

useSeoMeta({
  title: 'Mis entradas | VeriTix',
  description: 'Consultá tus entradas compradas, descargalas en PDF y verificá su estado desde tu cuenta.',
})

const { fetchMyTickets, getTicketPdfUrl } = useMyTickets()
const { notifyApiError } = useAppNotifications()

const tickets = ref<UserTicket[]>([])
const initialized = ref(false)
const pending = ref(false)
const errorMessage = ref('')
const page = ref(1)
const limit = 12

const meta = ref<PaginationMeta>({
  total: 0,
  page: 1,
  limit,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
})

const statusConfig: Record<string, { label: string; color: 'success' | 'neutral' | 'error' | 'warning'; icon: string }> = {
  ACTIVE: { label: 'Activa', color: 'success', icon: 'i-lucide-circle-check' },
  USED: { label: 'Usada', color: 'neutral', icon: 'i-lucide-circle-dot' },
  CANCELLED: { label: 'Cancelada', color: 'error', icon: 'i-lucide-circle-x' },
  REFUNDED: { label: 'Reembolsada', color: 'warning', icon: 'i-lucide-circle-arrow-left' },
}

function getStatusConfig(status: string) {
  return statusConfig[status] ?? { label: status, color: 'neutral' as const, icon: 'i-lucide-circle' }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price)
}

const showPagination = computed(
  () => !pending.value && tickets.value.length > 0 && meta.value.totalPages > 1,
)

async function loadTickets(targetPage = page.value) {
  pending.value = true

  try {
    errorMessage.value = ''
    const response = await fetchMyTickets(targetPage, limit)
    tickets.value = response.data
    meta.value = response.meta
    page.value = response.meta.page
  }
  catch (error) {
    errorMessage.value = 'No pudimos cargar tus entradas. Intentá de nuevo más tarde.'
    notifyApiError(error, 'No pudimos cargar tus entradas.', { id: 'my-tickets-load-error' })
  }
  finally {
    pending.value = false
    initialized.value = true
  }
}

async function goToPage(nextPage: number) {
  if (nextPage === page.value || pending.value) {
    return
  }

  await loadTickets(nextPage)
}

onMounted(() => {
  void loadTickets()
})
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <BaseContainer class="relative">
      <div class="mx-auto max-w-7xl space-y-8 sm:space-y-9">
        <UiPageHeading
          eyebrow="Mi cuenta"
          title="Entradas"
          description="Consultá tus entradas compradas, descargalas en PDF y verificá su estado de validación."
        />

        <div class="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)] xl:gap-10">
          <section class="space-y-6">
            <div v-if="!initialized" class="space-y-4">
              <BaseSkeleton v-for="index in 4" :key="index" class="h-28 rounded-2xl" />
            </div>

            <template v-else>
              <div v-if="showPagination" class="flex justify-end">
                <BasePagination
                  :page="meta.page"
                  :total="meta.total"
                  :items-per-page="meta.limit"
                  :disabled="pending"
                  :sibling-count="1"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  active-color="primary"
                  active-variant="soft"
                  show-edges
                  @update:page="goToPage"
                />
              </div>

              <div
                v-if="errorMessage"
                class="rounded-2xl border border-error/30 bg-error/8 px-6 py-14 text-center"
              >
                <div class="mx-auto flex max-w-md flex-col items-center gap-4">
                  <BaseIcon name="i-lucide-cloud-off" class="size-8 text-error" />
                  <div class="space-y-2">
                    <p class="text-lg font-semibold text-highlighted">
                      No pudimos cargar tus entradas.
                    </p>
                    <p class="text-sm leading-relaxed text-toned">
                      {{ errorMessage }}
                    </p>
                  </div>
                </div>
              </div>

              <UiEmptyState
                v-else-if="tickets.length === 0"
                icon="i-lucide-ticket"
                title="Todavía no tenés entradas"
                description="Cuando comprés una entrada aparecerá acá con su estado y opción de descarga."
                action-label="Ver eventos"
                action-to="/events"
              />

              <div v-else class="space-y-3">
                <UiPanel
                  v-for="ticket in tickets"
                  :key="ticket.id"
                  variant="glass"
                  radius="lg"
                  padding="md"
                  class="border-default/65 bg-elevated/20"
                >
                  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="flex min-w-0 items-start gap-4">
                      <div class="vtx-ticket-icon flex size-11 shrink-0 items-center justify-center rounded-xl">
                        <BaseIcon name="i-lucide-ticket" class="size-5 text-primary" />
                      </div>

                      <div class="min-w-0 space-y-1">
                        <p class="truncate text-base font-semibold text-highlighted">
                          {{ ticket.event.name }}
                        </p>
                        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span class="text-sm text-toned">{{ ticket.ticketType.name }}</span>
                          <span class="hidden text-default/40 sm:inline">·</span>
                          <span class="text-sm text-toned">{{ formatEventDate(ticket.event.eventDate) }}</span>
                        </div>
                        <p class="font-mono text-xs text-muted">
                          #{{ ticket.hash.slice(0, 12).toUpperCase() }}
                        </p>
                      </div>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:justify-end">
                      <div class="flex items-center gap-2">
                        <BaseBadge
                          kind="status"
                          :color="getStatusConfig(ticket.status).color"
                          :icon="getStatusConfig(ticket.status).icon"
                          size="sm"
                          leading
                        >
                          {{ getStatusConfig(ticket.status).label }}
                        </BaseBadge>

                        <BaseBadge kind="price" size="sm">
                          {{ formatPrice(ticket.ticketType.price) }}
                        </BaseBadge>
                      </div>

                      <BaseButton
                        v-if="ticket.status === 'ACTIVE'"
                        variant="secondary"
                        size="sm"
                        :to="getTicketPdfUrl(ticket.id)"
                        target="_blank"
                        external
                        leading-icon="i-lucide-download"
                      >
                        PDF
                      </BaseButton>
                    </div>
                  </div>
                </UiPanel>
              </div>

              <div v-if="showPagination" class="flex justify-center pt-2">
                <BasePagination
                  :page="meta.page"
                  :total="meta.total"
                  :items-per-page="meta.limit"
                  :disabled="pending"
                  :sibling-count="1"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  active-color="primary"
                  active-variant="soft"
                  show-edges
                  @update:page="goToPage"
                />
              </div>
            </template>
          </section>

          <aside class="space-y-6">
            <ClientOnly>
              <UiPanel variant="glass" radius="lg" padding="md" class="space-y-4">
                <UiMetaLabel>Resumen</UiMetaLabel>

                <div class="space-y-3">
                  <div class="vtx-stat-row">
                    <span class="text-sm text-toned">Total de entradas</span>
                    <span class="text-sm font-semibold text-highlighted">
                      {{ initialized ? meta.total : '—' }}
                    </span>
                  </div>

                  <div class="vtx-stat-row">
                    <span class="text-sm text-toned">Activas</span>
                    <span class="text-sm font-semibold text-success">
                      {{ initialized ? tickets.filter(t => t.status === 'ACTIVE').length : '—' }}
                    </span>
                  </div>

                  <div class="vtx-stat-row">
                    <span class="text-sm text-toned">Usadas</span>
                    <span class="text-sm font-semibold text-toned">
                      {{ initialized ? tickets.filter(t => t.status === 'USED').length : '—' }}
                    </span>
                  </div>
                </div>
              </UiPanel>

              <UiPanel variant="glass" radius="lg" padding="md" class="space-y-3">
                <UiMetaLabel>¿Necesitás ayuda?</UiMetaLabel>
                <p class="text-sm leading-relaxed text-toned">
                  Si tenés problemas con una entrada, contactá al organizador del evento o al soporte de VeriTix.
                </p>
              </UiPanel>

              <template #fallback>
                <div class="space-y-4" aria-hidden="true">
                  <BaseSkeleton class="h-40 rounded-2xl" />
                  <BaseSkeleton class="h-24 rounded-2xl" />
                </div>
              </template>
            </ClientOnly>
          </aside>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-ticket-icon {
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.vtx-stat-row {
  @apply flex items-center justify-between border-b border-default/40 pb-3 last:border-0 last:pb-0;
}
</style>
