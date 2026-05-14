<script setup lang="ts">
interface ToolbarChipItem {
  label: string
  value: string | number
}

defineProps<{
  items: ToolbarChipItem[]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2.5">
    <span
      v-for="item in items"
      :key="item.label"
      class="inline-flex items-center gap-2 rounded-full border border-default/60 bg-elevated/45 px-3 py-1.5 text-sm text-toned shadow-sm backdrop-blur-sm"
    >
      <strong class="inline-flex min-w-8 items-center justify-center rounded-full bg-primary/12 px-2 py-0.5 text-[0.72rem] font-semibold tracking-[0.04em] text-primary">
        {{ item.value }}
      </strong>
      {{ item.label }}
    </span>
  </div>
</template>
