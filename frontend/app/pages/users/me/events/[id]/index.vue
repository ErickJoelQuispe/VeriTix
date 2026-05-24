<script setup lang="ts">
import type { PaginatedResponse } from '~~/shared/api/types'
import type { Review, UserTicket } from '~~/shared/types'
import { useOrdersRepository } from '@/repositories/ordersRepository'
import { useTicketsRepository } from '@/repositories/ticketsRepository'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const eventId = route.params.id as string

// ── Data fetching ─────────────────────────────────────────────────────────────

const { events, fetchMyEvents } = useMyEvents()
const { tickets, isLoading: isLoadingTickets } = useMyTickets()
const { orders, isLoading: isLoadingOrders } = useMyOrders()
const { myReview, fetchMyReview } = useReview(eventId)
const { listMyTickets } = useTicketsRepository()
const { listMyOrders } = useOrdersRepository()
const hasLoaded = ref(false)

async function fetchAllPages<T>(
  fetcher: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
): Promise<T[]> {
  const all: T[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const response = await fetcher(page, 100)
    all.push(...response.data)
    hasMore = response.meta.hasNext ?? false
    page++
  }

  return all
}

onMounted(async () => {
  hasLoaded.value = false

  try {
    const [allTickets, allOrders] = await Promise.all([
      fetchAllPages(listMyTickets),
      fetchAllPages(listMyOrders),
    ])

    tickets.value = allTickets
    isLoadingTickets.value = false

    orders.value = allOrders
    isLoadingOrders.value = false

    await Promise.all([
      fetchMyEvents({ page: 1, limit: 100 }),
      fetchMyReview(),
    ])
  }
  finally {
    hasLoaded.value = true
  }
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

// ── Tickets pagination ─────────────────────────────────────────────────────────

const TICKETS_PER_PAGE = 5
const ticketPage = ref(1)
const totalTicketPages = computed(() =>
  Math.max(1, Math.ceil(eventTickets.value.length / TICKETS_PER_PAGE)),
)
const paginatedTickets = computed(() => {
  const start = (ticketPage.value - 1) * TICKETS_PER_PAGE
  return eventTickets.value.slice(start, start + TICKETS_PER_PAGE)
})

function onTicketPageChange(newPage: number) {
  ticketPage.value = newPage
}

// ── Orders pagination ──────────────────────────────────────────────────────────

const ORDERS_PER_PAGE = 5
const orderPage = ref(1)
const totalOrderPages = computed(() =>
  Math.max(1, Math.ceil(eventOrders.value.length / ORDERS_PER_PAGE)),
)
const paginatedOrders = computed(() => {
  const start = (orderPage.value - 1) * ORDERS_PER_PAGE
  return eventOrders.value.slice(start, start + ORDERS_PER_PAGE)
})

function onOrderPageChange(newPage: number) {
  orderPage.value = newPage
}

// ── Ticket modal ───────────────────────────────────────────────────────────────

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
      <div class="mx-auto max-w-6xl space-y-8 sm:space-y-10">
        <!-- Loading state -->
        <template v-if="!hasLoaded">
          <div class="flex min-h-[40vh] items-center justify-center py-20">
            <p class="text-sm text-toned">
              El evento se está cargando...
            </p>
          </div>
        </template>

        <!-- Event not found -->
        <template v-else-if="!currentEventItem">
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

          <UsersEventHeader :event="currentEventItem.event">
            <div class="space-y-6">
              <!-- Tabs -->
              <UsersEventTabs
                v-model:active-tab="activeTab"
              />

              <!-- Tab content -->
              <div class="min-h-50">
                <template v-if="activeTab === 'tickets'">
                  <div class="space-y-6">
                    <TicketList
                      :tickets="paginatedTickets"
                      :is-loading="isLoadingTickets"
                      @open-ticket="openModal"
                    />

                    <div v-if="totalTicketPages > 1" class="flex justify-center">
                      <BasePagination
                        :page="ticketPage"
                        :total="eventTickets.length"
                        :items-per-page="TICKETS_PER_PAGE"
                        :sibling-count="1"
                        size="sm"
                        color="neutral"
                        variant="ghost"
                        active-color="primary"
                        active-variant="soft"
                        show-edges
                        @update:page="onTicketPageChange"
                      />
                    </div>
                  </div>
                </template>

                <template v-else-if="activeTab === 'orders'">
                  <div class="space-y-6">
                    <OrderList
                      :orders="paginatedOrders"
                      :is-loading="isLoadingOrders"
                    />

                    <div v-if="totalOrderPages > 1" class="flex justify-center">
                      <BasePagination
                        :page="orderPage"
                        :total="eventOrders.length"
                        :items-per-page="ORDERS_PER_PAGE"
                        :sibling-count="1"
                        size="sm"
                        color="neutral"
                        variant="ghost"
                        active-color="primary"
                        active-variant="soft"
                        show-edges
                        @update:page="onOrderPageChange"
                      />
                    </div>
                  </div>
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
            </div>
          </UsersEventHeader>
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
