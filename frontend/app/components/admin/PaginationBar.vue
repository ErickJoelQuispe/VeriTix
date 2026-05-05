<script setup lang="ts">
const props = withDefaults(defineProps<{
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  pending?: boolean
}>(), {
  pending: false,
})

const emit = defineEmits<{
  change: [page: number]
}>()

function goToPage(page: number) {
  if (props.pending || page < 1 || page > props.totalPages || page === props.page) {
    return
  }

  emit('change', page)
}
</script>

<template>
  <div class="admin-pagination flex rounded-xl bg-elevated/20 px-3 py-2.5 sm:px-4 sm:py-3">
    <div class="flex w-full flex-wrap items-center justify-center">
      <BasePagination
        :page="page"
        :total="totalItems"
        :items-per-page="pageSize"
        :disabled="pending"
        :sibling-count="1"
        :show-edges="totalPages > 5"
        size="lg"
        @update:page="goToPage"
      />
    </div>
  </div>
</template>
