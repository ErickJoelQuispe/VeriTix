<script setup lang="ts">
import type { Review, UserTicket } from '~~/shared/types'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const eventId = route.params.id as string

// ── Data fetching ─────────────────────────────────────────────────────────────

const { events, fetchMyEvents } = useMyEvents()
const { tickets, isLoading: isLoadingTickets, fetchMyTickets } = useMyTickets()
const { orders, isLoading: isLoadingOrders, fetchMyOrders } = useMyOrders()
const { myReview, fetchMyReview } = useReview(eventId)

// Fetch all data in parallel on mount
onMounted(async () => {
  await Promise.all([
    fetchMyEvents({ page: 1, limit: 100 }),
    fetchMyTickets(1, 100),
    fetchMyOrders(1, 100),
    fetchMyReview(),
  ])
})

// ── Derived state ─────────────────────────────────────────────────────────────

const currentEventItem = computed(() =>
  events.value.find(item => item.event.id === eventId) ?? null,
)

const eventTickets = computed(() =>
  tickets.value.filter(t => t.event.id === eventId),
)

const eventOrders = computed(() =>
  orders.value.filter(o => o.event.id === eventId),
)

const hasUsedTicket = computed(() =>
  eventTickets.value.some(t => t.status === 'USED'),
)

// ── Tab state ─────────────────────────────────────────────────────────────────

const activeTab = ref<'tickets' | 'orders' | 'review'>('tickets')

// ── Review handlers ───────────────────────────────────────────────────────────

function onReviewSubmitted(review: Review) {
  myReview.value = review
}

function onReviewDeleted() {
  myReview.value = null
}

// ── Ticket modal ──────────────────────────────────────────────────────────────

const selectedTicket = ref<UserTicket | null>(null)
const isModalOpen = ref(false)

function openModal(ticket: UserTicket) {
  selectedTicket.value = ticket
  isModalOpen.value = true
}

// ── SEO ───────────────────────────────────────────────────────────────────────

useSeoMeta({
  title: computed(() =>
    currentEventItem.value
      ? `${currentEventItem.value.event.name} | Mis Eventos | VeriTix`
      : 'Mis Eventos | VeriTix',
  ),
})
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <BaseContainer>
      <div class="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        <!-- Event not found -->
        <template v-if="!currentEventItem">
          <UiEmptyState
            icon="i-lucide-calendar-x"
            title="Evento no encontrado"
            description="No tenés entradas para este evento."
            action-label="Volver a mis eventos"
            action-to="/users/me/events"
          />
        </template>

        <!-- Event found -->
        <template v-else>
          <NuxtLink to="/users/me/events" class="inline-flex items-center gap-2 text-sm text-toned transition-colors hover:text-highlighted">
            <BaseIcon name="i-lucide-arrow-left" class="size-4" />
            Volver a eventos
          </NuxtLink>

          <!-- Header -->
          <UsersEventHeader :event="currentEventItem.event" />

          <!-- Tabs -->
          <UsersEventTabs
            v-model:active-tab="activeTab"
          />

          <!-- Tab content -->
          <div class="min-h-[200px]">
            <template v-if="activeTab === 'tickets'">
              <TicketList
                :tickets="eventTickets"
                :is-loading="isLoadingTickets"
                @open-ticket="openModal"
              />
            </template>

            <template v-else-if="activeTab === 'orders'">
              <OrderList
                :orders="eventOrders"
                :is-loading="isLoadingOrders"
              />
            </template>

            <template v-else-if="activeTab === 'review'">
              <div class="space-y-8">
                <ReviewForm
                  :event-id="eventId"
                  :existing-review="myReview"
                  :has-used-ticket="hasUsedTicket"
                  @submitted="onReviewSubmitted"
                  @deleted="onReviewDeleted"
                />
                <ReviewList :event-id="eventId" />
              </div>
            </template>
          </div>
        </template>

        <!-- Ticket Modal -->
        <TicketModal
          v-model:open="isModalOpen"
          :ticket="selectedTicket"
          @transfer-initiated="isModalOpen = false"
        />
      </div>
    </BaseContainer>
  </section>
</template>
