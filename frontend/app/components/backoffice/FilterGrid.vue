<script setup lang="ts">
import type {
  BackofficeFilterControl,
  BackofficeFilterFieldControl,
  BackofficeFilterSelectControl,
} from '~/types/backoffice'

defineProps<{
  items: BackofficeFilterControl[]
  gridClass: string
}>()

function handleFieldUpdate(item: BackofficeFilterFieldControl, value: string | number | undefined) {
  item.onUpdate(String(value ?? ''))
}

function handleSelectUpdate(item: BackofficeFilterSelectControl, value: string | number | undefined) {
  item.onUpdate(value ?? '')
}
</script>

<template>
  <div class="grid grid-cols-1 items-end gap-4" :class="gridClass">
    <template v-for="item in items" :key="item.key">
      <FormField
        v-if="item.kind === 'field'"
        :name="item.name"
        :label="item.label"
        :model-value="item.modelValue"
        :placeholder="item.placeholder"
        :icon="item.icon"
        :type="item.type"
        :disabled="item.disabled"
        @update:model-value="handleFieldUpdate(item, $event)"
      />

      <FormSelect
        v-else
        :name="item.name"
        :label="item.label"
        :items="item.items"
        :model-value="item.modelValue"
        :size="item.size ?? 'md'"
        :disabled="item.disabled"
        @update:model-value="handleSelectUpdate(item, $event)"
      />
    </template>
  </div>
</template>
