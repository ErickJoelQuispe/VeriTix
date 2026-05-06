<script setup lang="ts">
interface SegmentedControlItem {
  value: string
  label: string
  icon?: string
  to?: string
  disabled?: boolean
  testId?: string
}

withDefaults(defineProps<{
  items: SegmentedControlItem[]
  activeValue: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  size: 'sm',
})

const emit = defineEmits<{
  select: [value: string]
}>()

function handleSelect(item: SegmentedControlItem) {
  if (item.disabled || item.to) {
    return
  }

  emit('select', item.value)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5 rounded-2xl border border-default/70 bg-elevated/80 p-1">
    <BaseButton
      v-for="item in items"
      :key="item.value"
      :to="item.to"
      kind="tertiary"
      :size="size"
      :leading-icon="item.icon"
      :disabled="item.disabled"
      :data-testid="item.testId || undefined"
      :aria-current="activeValue === item.value ? 'page' : undefined"
      class="min-w-0 border-transparent shadow-none transition-all duration-200"
      :class="activeValue === item.value
        ? '!border-primary/45 bg-primary/20 text-highlighted shadow-sm ring-1 ring-primary/30 hover:bg-primary/24 hover:ring-primary/40'
        : 'text-toned hover:-translate-y-px hover:border-default/55 hover:bg-default/70 hover:text-highlighted hover:shadow-sm'"
      @click="handleSelect(item)"
    >
      <span class="inline-flex items-center gap-2">
        <span>{{ item.label }}</span>
        <span
          v-if="activeValue === item.value"
          aria-hidden="true"
          class="h-1.5 w-3 rounded-full bg-primary/90"
        />
      </span>
    </BaseButton>
  </div>
</template>
