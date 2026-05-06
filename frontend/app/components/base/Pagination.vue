<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  page?: number
  total: number
  itemsPerPage: number
  disabled?: boolean
  siblingCount?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost'
  activeColor?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  activeVariant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost'
  showEdges?: boolean
}>(), {
  page: 1,
  disabled: false,
  siblingCount: 1,
  size: 'md',
  color: 'neutral',
  variant: 'ghost',
  activeColor: 'primary',
  activeVariant: 'soft',
  showEdges: false,
})

const emit = defineEmits<{
  'update:page': [page: number]
}>()
const attrs = useAttrs()
const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const paginationClass = computed(() => attrs.class)

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(props.total / props.itemsPerPage))
})

const currentPage = computed(() => {
  return Math.min(Math.max(props.page ?? 1, 1), totalPages.value)
})

const pageItems = computed<Array<number | 'ellipsis'>>(() => {
  if (totalPages.value <= 7) {
    return Array.from({ length: totalPages.value }, (_, index) => index + 1)
  }

  const siblings = props.siblingCount ?? 1
  const firstPage = 1
  const lastPage = totalPages.value
  const start = Math.max(currentPage.value - siblings, 2)
  const end = Math.min(currentPage.value + siblings, lastPage - 1)
  const items: Array<number | 'ellipsis'> = [firstPage]

  if (start > 2) {
    items.push('ellipsis')
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (end < lastPage - 1) {
    items.push('ellipsis')
  }

  items.push(lastPage)

  return items
})

function goToPage(nextPage: number) {
  if (props.disabled || nextPage < 1 || nextPage > totalPages.value || nextPage === currentPage.value) {
    return
  }

  emit('update:page', nextPage)
}
</script>

<template>
  <nav v-bind="forwardedAttrs" class="flex flex-col items-center gap-3 sm:flex-row" :class="[paginationClass]" aria-label="Pagination">
    <div v-if="showEdges" class="flex items-center gap-2">
      <BaseButton kind="tertiary" :size="size" :disabled="disabled || currentPage === 1" @click="goToPage(1)">
        <span class="sr-only">Primera página</span>
        «
      </BaseButton>
      <BaseButton kind="tertiary" :size="size" :disabled="disabled || currentPage === 1" @click="goToPage(currentPage - 1)">
        <span class="sr-only">Página anterior</span>
        ‹
      </BaseButton>
    </div>

    <div class="flex items-center gap-1">
      <template v-for="(item, index) in pageItems" :key="`${item}-${index}`">
        <span v-if="item === 'ellipsis'" class="inline-flex min-w-9 items-center justify-center px-2 text-toned">…</span>
        <button
          v-else
          type="button"
          class="inline-flex min-w-9 items-center justify-center rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
          :class="item === currentPage ? 'border-primary/45 bg-primary/20 text-highlighted ring-primary/30' : 'border-default/55 bg-default/20 text-toned hover:border-default/75 hover:bg-default/35 hover:text-highlighted'"
          :disabled="disabled"
          :aria-current="item === currentPage ? 'page' : undefined"
          @click="goToPage(Number(item))"
        >
          {{ item }}
        </button>
      </template>
    </div>

    <div v-if="showEdges" class="flex items-center gap-2">
      <BaseButton kind="tertiary" :size="size" :disabled="disabled || currentPage === totalPages" @click="goToPage(currentPage + 1)">
        <span class="sr-only">Página siguiente</span>
        ›
      </BaseButton>
      <BaseButton kind="tertiary" :size="size" :disabled="disabled || currentPage === totalPages" @click="goToPage(totalPages)">
        <span class="sr-only">Última página</span>
        »
      </BaseButton>
    </div>
  </nav>
</template>
