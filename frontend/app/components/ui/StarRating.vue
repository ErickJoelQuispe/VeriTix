<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: number
  readonly?: boolean
  size?: 'sm' | 'md'
}>(), {
  readonly: true,
  size: 'md',
})

const stars = computed(() =>
  Array.from({ length: 5 }, (_, i) => ({
    index: i + 1,
    filled: i + 1 <= props.modelValue,
  })),
)

const iconSize = computed(() => props.size === 'sm' ? 'size-3.5' : 'size-5')
</script>

<template>
  <div class="flex items-center gap-0.5" role="img" :aria-label="`${modelValue} de 5 estrellas`">
    <BaseIcon
      v-for="star in stars"
      :key="star.index"
      name="i-lucide-star"
      :class="[iconSize, star.filled ? 'text-primary' : 'text-muted/40']"
    />
  </div>
</template>
