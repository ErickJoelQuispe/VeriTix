<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: number
  readonly?: boolean
  size?: 'sm' | 'md'
}>(), {
  readonly: true,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoverRating = ref(0)

const stars = computed(() =>
  Array.from({ length: 5 }, (_, i) => ({
    index: i + 1,
    filled: i + 1 <= (props.readonly ? props.modelValue : (hoverRating.value || props.modelValue)),
  })),
)

const iconSize = computed(() => props.size === 'sm' ? 'size-3.5' : 'size-5')

function handleClick(index: number) {
  if (!props.readonly) {
    emit('update:modelValue', index)
  }
}

function handleMouseEnter(index: number) {
  if (!props.readonly) {
    hoverRating.value = index
  }
}

function handleMouseLeave() {
  if (!props.readonly) {
    hoverRating.value = 0
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (props.readonly) return

  const current = props.modelValue || 0

  if (event.key === 'ArrowRight' && current < 5) {
    emit('update:modelValue', current + 1)
  }
  else if (event.key === 'ArrowLeft' && current > 1) {
    emit('update:modelValue', current - 1)
  }
}
</script>

<template>
  <div
    class="flex items-center gap-0.5"
    :role="readonly ? 'img' : 'group'"
    :aria-label="readonly ? `${modelValue} de 5 estrellas` : `Calificación: ${modelValue} de 5 estrellas`"
    :tabindex="readonly ? undefined : 0"
    :aria-roledescription="readonly ? undefined : 'selector de estrellas'"
    @keydown="handleKeydown"
  >
    <button
      v-for="star in stars"
      :key="star.index"
      type="button"
      :class="[
        'focus:outline-none',
        readonly ? 'cursor-default pointer-events-none' : 'cursor-pointer',
      ]"
      :disabled="readonly"
      :aria-label="readonly ? undefined : `${star.index} estrella${star.index !== 1 ? 's' : ''}`"
      :tabindex="readonly ? -1 : 0"
      @click="handleClick(star.index)"
      @mouseenter="handleMouseEnter(star.index)"
      @mouseleave="handleMouseLeave"
    >
      <BaseIcon
        name="i-lucide-star"
        :class="[
          iconSize,
          star.filled ? 'text-primary' : 'text-muted/40',
          !readonly ? 'transition-colors duration-100' : '',
        ]"
      />
    </button>
  </div>
</template>
