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
      class="inline-flex items-center gap-2 rounded-full border border-default/70 bg-default/30 px-3 py-1.5 font-mono text-[0.66rem] tracking-[0.12em] text-toned uppercase"
    >
      <strong class="font-medium text-highlighted">{{ item.value }}</strong>
      {{ item.label }}
    </span>
  </div>
</template>
