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

const buttonSizeClass = computed(() => {
  return {
    xs: 'h-8 w-8 text-xs',
    sm: 'h-9 w-9 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-11 w-11 text-sm',
    xl: 'h-12 w-12 text-base',
  }[props.size]
})

const iconSizeClass = computed(() => {
  return {
    xs: 'size-4',
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-5',
    xl: 'size-5',
  }[props.size]
})

function isActivePage(page: number) {
  return page === currentPage.value
}

function pageStateClass(page: number) {
  if (isActivePage(page)) {
    return 'border-lavender/65 bg-lavender/24 text-white shadow-[0_12px_28px_-18px_rgba(156,125,255,0.65)] ring-1 ring-inset ring-lavender/30'
  }

  return props.disabled
    ? 'border-default/35 bg-default/10 text-toned/55'
    : 'border-default/65 bg-elevated/55 text-highlighted shadow-[0_10px_22px_-18px_rgba(0,0,0,0.72)] hover:border-lavender/45 hover:bg-lavender/14 hover:text-white hover:shadow-[0_12px_28px_-18px_rgba(156,125,255,0.55)]'
}

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
  <nav v-bind="forwardedAttrs" class="flex items-center gap-2 overflow-x-auto whitespace-nowrap sm:overflow-visible" :class="[paginationClass]" aria-label="Pagination">
    <div v-if="showEdges" class="flex shrink-0 items-center gap-2">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/30"
        :class="[
          buttonSizeClass,
          disabled || currentPage === 1
            ? 'cursor-not-allowed border-default/35 bg-default/10 text-toned/55'
            : 'border-default/65 bg-elevated/55 text-highlighted shadow-[0_10px_22px_-18px_rgba(0,0,0,0.72)] hover:border-lavender/45 hover:bg-lavender/14 hover:text-white hover:shadow-[0_12px_28px_-18px_rgba(156,125,255,0.55)]',
        ]"
        :disabled="disabled || currentPage === 1"
        @click="goToPage(1)"
      >
        <span class="sr-only">Primera página</span>
        <BaseIcon name="i-lucide-chevrons-left" :class="iconSizeClass" />
      </button>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/30"
        :class="[
          buttonSizeClass,
          disabled || currentPage === 1
            ? 'cursor-not-allowed border-default/35 bg-default/10 text-toned/55'
            : 'border-default/65 bg-elevated/55 text-highlighted shadow-[0_10px_22px_-18px_rgba(0,0,0,0.72)] hover:border-lavender/45 hover:bg-lavender/14 hover:text-white hover:shadow-[0_12px_28px_-18px_rgba(156,125,255,0.55)]',
        ]"
        :disabled="disabled || currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <span class="sr-only">Página anterior</span>
        <BaseIcon name="i-lucide-chevron-left" :class="iconSizeClass" />
      </button>
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <template v-for="(item, index) in pageItems" :key="`${item}-${index}`">
        <span v-if="item === 'ellipsis'" class="inline-flex h-10 w-10 shrink-0 items-center justify-center text-toned/70">…</span>
        <button
          v-else
          type="button"
          class="inline-flex shrink-0 items-center justify-center rounded-lg border font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/30"
          :class="[buttonSizeClass, pageStateClass(Number(item))]"
          :disabled="disabled"
          :aria-current="item === currentPage ? 'page' : undefined"
          @click="goToPage(Number(item))"
        >
          {{ item }}
        </button>
      </template>
    </div>

    <div v-if="showEdges" class="flex shrink-0 items-center gap-2">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/30"
        :class="[
          buttonSizeClass,
          disabled || currentPage === totalPages
            ? 'cursor-not-allowed border-default/35 bg-default/10 text-toned/55'
            : 'border-default/65 bg-elevated/55 text-highlighted shadow-[0_10px_22px_-18px_rgba(0,0,0,0.72)] hover:border-lavender/45 hover:bg-lavender/14 hover:text-white hover:shadow-[0_12px_28px_-18px_rgba(156,125,255,0.55)]',
        ]"
        :disabled="disabled || currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <span class="sr-only">Página siguiente</span>
        <BaseIcon name="i-lucide-chevron-right" :class="iconSizeClass" />
      </button>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/30"
        :class="[
          buttonSizeClass,
          disabled || currentPage === totalPages
            ? 'cursor-not-allowed border-default/35 bg-default/10 text-toned/55'
            : 'border-default/65 bg-elevated/55 text-highlighted shadow-[0_10px_22px_-18px_rgba(0,0,0,0.72)] hover:border-lavender/45 hover:bg-lavender/14 hover:text-white hover:shadow-[0_12px_28px_-18px_rgba(156,125,255,0.55)]',
        ]"
        :disabled="disabled || currentPage === totalPages"
        @click="goToPage(totalPages)"
      >
        <span class="sr-only">Última página</span>
        <BaseIcon name="i-lucide-chevrons-right" :class="iconSizeClass" />
      </button>
    </div>
  </nav>
</template>
