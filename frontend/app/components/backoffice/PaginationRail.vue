<script setup lang="ts">
withDefaults(defineProps<{
  page: number
  total: number
  itemsPerPage: number
  pending?: boolean
  showEdges?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  pending: false,
  showEdges: false,
  size: 'lg',
})

const emit = defineEmits<{
  'update:page': [page: number]
}>()

function onPageChange(nextPage: number) {
  emit('update:page', nextPage)
}
</script>

<template>
  <div class="rounded-xl bg-elevated/20 px-3 py-2.5 sm:px-4 sm:py-3">
    <div class="flex w-full flex-wrap items-center justify-center">
      <BasePagination
        :page="page"
        :total="total"
        :items-per-page="itemsPerPage"
        :disabled="pending"
        :sibling-count="1"
        :show-edges="showEdges"
        :size="size"
        @update:page="onPageChange"
      />
    </div>
  </div>
</template>
