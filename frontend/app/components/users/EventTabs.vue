<script setup lang="ts">
type TabId = 'tickets' | 'orders' | 'review'

const props = defineProps<{
  activeTab: TabId
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: TabId]
}>()

const tabs = [
  { id: 'tickets' as TabId, label: 'Mis Entradas', icon: 'i-lucide-ticket' },
  { id: 'orders' as TabId, label: 'Mis Órdenes', icon: 'i-lucide-receipt' },
  { id: 'review' as TabId, label: 'Reseña', icon: 'i-lucide-star' },
]
</script>

<template>
  <div class="flex flex-wrap gap-2" role="tablist" aria-label="Secciones del evento">
    <BaseButton
      v-for="tab in tabs"
      :key="tab.id"
      :variant="props.activeTab === tab.id ? 'primary' : 'outlined'"
      size="sm"
      :leading-icon="tab.icon"
      role="tab"
      :aria-selected="props.activeTab === tab.id"
      @click="emit('update:activeTab', tab.id)"
    >
      {{ tab.label }}
    </BaseButton>
  </div>
</template>
