<script setup lang="ts">
import type { Review } from '~~/shared/types'

const props = defineProps<{
  eventId: string
  existingReview?: Review | null
  hasUsedTicket: boolean
}>()

const emit = defineEmits<{
  submitted: [review: Review]
  deleted: []
}>()

const { myReview, isLoading, error, submitReview, removeReview } = useReview(props.eventId)

// Pre-fill if editing an existing review
const formState = reactive({
  rating: props.existingReview?.rating ?? 0,
  comment: props.existingReview?.comment ?? '',
})

const submitError = ref<string | null>(null)
const isDeleting = ref(false)

// Sync when existingReview prop changes
watch(() => props.existingReview, (review) => {
  if (review) {
    formState.rating = review.rating
    formState.comment = review.comment
  }
  else {
    formState.rating = 0
    formState.comment = ''
  }
})

// Sync myReview from composable when existingReview provided externally
onMounted(() => {
  if (props.existingReview) {
    myReview.value = props.existingReview
  }
})

const isValid = computed(() =>
  formState.rating >= 1 && formState.rating <= 5 && formState.comment.trim().length >= 1,
)

const isEditing = computed(() => !!props.existingReview)

async function handleSubmit() {
  submitError.value = null

  if (!isValid.value) {
    if (formState.rating === 0) {
      submitError.value = 'Seleccioná una calificación del 1 al 5.'
      return
    }
    if (!formState.comment.trim()) {
      submitError.value = 'El comentario no puede estar vacío.'
      return
    }
    return
  }

  try {
    await submitReview({
      rating: formState.rating,
      comment: formState.comment.trim(),
    })

    if (myReview.value) {
      emit('submitted', myReview.value)
    }
  }
  catch {
    submitError.value = error.value ?? 'No pudimos guardar tu reseña.'
  }
}

async function handleDelete() {
  // eslint-disable-next-line no-alert
  const confirmed = confirm('¿Eliminar tu reseña?')
  if (!confirmed) { return }

  isDeleting.value = true
  submitError.value = null

  try {
    await removeReview()
    formState.rating = 0
    formState.comment = ''
    emit('deleted')
  }
  catch {
    submitError.value = error.value ?? 'No pudimos eliminar tu reseña.'
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <!-- Blocked: no used ticket -->
  <UiPanel v-if="!hasUsedTicket" variant="glass" padding="lg" radius="xl">
    <div class="flex flex-col items-center gap-3 py-4 text-center">
      <BaseIcon name="i-lucide-lock" class="size-8 text-muted/60" />
      <p class="text-sm text-toned">
        Necesitás haber asistido al evento para dejar una reseña.
      </p>
    </div>
  </UiPanel>

  <!-- Review form -->
  <UiPanel v-else variant="glass" padding="xl" radius="xl" class="space-y-5">
    <UiMetaLabel>Tu reseña</UiMetaLabel>

    <div class="space-y-2">
      <p class="text-sm font-medium text-toned">
        Calificación
      </p>
      <ReviewStarRating
        v-model="formState.rating"
        :readonly="false"
        size="md"
      />
    </div>

    <div class="space-y-2">
      <FormTextarea
        v-model="formState.comment"
        name="comment"
        label="Comentario"
        placeholder="Contá cómo fue..."
        :rows="4"
        size="md"
        maxlength="1000"
      />
      <p class="text-right text-xs text-muted">
        {{ formState.comment.length }}/1000
      </p>
    </div>

    <!-- Error -->
    <p v-if="submitError" class="text-sm text-error">
      {{ submitError }}
    </p>

    <!-- Actions -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <template v-if="isEditing">
        <BaseButton
          variant="danger"
          size="sm"
          :loading="isDeleting"
          :disabled="isLoading"
          @click="handleDelete"
        >
          Eliminar reseña
        </BaseButton>

        <BaseButton
          variant="primary"
          size="md"
          :loading="isLoading"
          :disabled="!isValid || isDeleting"
          @click="handleSubmit"
        >
          Guardar cambios
        </BaseButton>
      </template>

      <template v-else>
        <span />
        <BaseButton
          variant="primary"
          size="md"
          :loading="isLoading"
          :disabled="!isValid"
          @click="handleSubmit"
        >
          Enviar reseña
        </BaseButton>
      </template>
    </div>
  </UiPanel>
</template>
