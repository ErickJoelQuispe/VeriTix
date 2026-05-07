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
      <UPagination
        :page="page"
        :total="totalItems"
        :items-per-page="pageSize"
        :disabled="pending"
        size="lg"
        color="neutral"
        variant="outline"
        active-color="primary"
        active-variant="solid"
        :sibling-count="1"
        show-controls
        :show-edges="totalPages > 5"
        :ui="{
          list: 'gap-1',
          label: 'min-w-10 text-center',
          item: 'rounded-sm! border-default/60',
          first: 'rounded-sm! border-default/60',
          prev: 'rounded-sm! border-default/60',
          next: 'rounded-sm! border-default/60',
          last: 'rounded-sm! border-default/60',
        }"
        @update:page="goToPage"
      />
    </div>
  </div>
</template>
