<script setup lang="ts">
const props = defineProps<{
  eventId: string
}>()

const { reviews, total, isLoading, error, publicMeta, fetchPublicReviews } = useReview(props.eventId)

const LIMIT = 10

onMounted(async () => {
  await fetchPublicReviews(1)
})

async function changePage(page: number) {
  await fetchPublicReviews(page)
}

function getInitials(name: string, lastName: string): string {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}
</script>

<template>
  <div class="space-y-4">
    <UiMetaLabel>Reseñas del evento</UiMetaLabel>

    <!-- Loading skeleton -->
    <template v-if="isLoading">
      <div class="space-y-3">
        <UiPanel
          v-for="i in 3"
          :key="i"
          variant="glass"
          padding="lg"
          radius="xl"
        >
          <div class="flex items-start gap-3">
            <BaseSkeleton class="size-10 rounded-full shrink-0" />
            <div class="flex-1 space-y-2">
              <BaseSkeleton class="h-4 w-32 rounded" />
              <BaseSkeleton class="h-3 w-20 rounded" />
              <BaseSkeleton class="h-10 w-full rounded" />
            </div>
          </div>
        </UiPanel>
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="error">
      <UiPanel variant="glass" padding="lg" radius="xl">
        <p class="text-sm text-error">
          {{ error }}
        </p>
      </UiPanel>
    </template>

    <!-- Empty state -->
    <template v-else-if="reviews.length === 0">
      <UiEmptyState
        icon="i-lucide-message-square-off"
        title="Sin reseñas todavía"
        description="Sé el primero en dejar tu opinión sobre este evento."
      />
    </template>

    <!-- Review list -->
    <template v-else>
      <div class="space-y-3">
        <UiPanel
          v-for="review in reviews"
          :key="review.id"
          variant="glass"
          padding="lg"
          radius="xl"
          class="space-y-3"
        >
          <div class="flex items-start gap-3">
            <!-- Avatar with initials -->
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {{ getInitials(review.user.name, review.user.lastName) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-semibold text-highlighted">
                  {{ review.user.name }} {{ review.user.lastName }}
                </span>
                <ReviewStarRating :model-value="review.rating" :readonly="true" size="sm" />
                <span class="text-xs text-muted">
                  {{ formatDate(review.createdAt) }}
                </span>
              </div>

              <p class="mt-2 text-sm leading-relaxed text-toned">
                {{ review.comment }}
              </p>
            </div>
          </div>
        </UiPanel>
      </div>

      <!-- Pagination -->
      <div v-if="total > LIMIT" class="flex justify-center pt-2">
        <BasePagination
          :page="publicMeta?.page ?? 1"
          :total="total"
          :items-per-page="LIMIT"
          @update:page="changePage"
        />
      </div>
    </template>
  </div>
</template>
