<script setup lang="ts">
import type { Review } from '~~/shared/types'

defineProps<{
  review: Review
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}
</script>

<template>
  <UiPanel variant="glass" padding="lg" radius="xl" class="space-y-3">
    <UiMetaLabel>Mi reseña</UiMetaLabel>

    <UiStarRating
      :model-value="review.rating"
      :readonly="true"
      size="md"
    />

    <p class="text-sm leading-relaxed text-toned">
      "{{ review.comment }}"
    </p>

    <div class="flex flex-wrap items-center gap-3 pt-1">
      <span class="text-xs text-muted">
        {{ formatDate(review.createdAt) }}
      </span>

      <div class="ml-auto flex items-center gap-2">
        <BaseButton
          variant="outlined"
          size="sm"
          leading-icon="i-lucide-pencil"
          @click="emit('edit')"
        >
          Editar
        </BaseButton>

        <BaseButton
          variant="danger"
          size="sm"
          leading-icon="i-lucide-trash-2"
          @click="emit('delete')"
        >
          Eliminar
        </BaseButton>
      </div>
    </div>
  </UiPanel>
</template>
