<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  content?: {
    align?: 'start' | 'end' | 'center'
    side?: 'top' | 'bottom'
    sideOffset?: number
  }
}>(), {
  content: () => ({
    align: 'start',
    side: 'bottom',
    sideOffset: 10,
  }),
})

const open = defineModel<boolean>('open', { default: false })
const attrs = useAttrs()
const root = ref<HTMLElement | null>(null)

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const popoverClass = computed(() => {
  const alignClass = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }[props.content?.align ?? 'start']

  const sideClass = props.content?.side === 'top'
    ? 'bottom-[calc(100%+var(--popover-offset))]'
    : 'top-[calc(100%+var(--popover-offset))]'

  return [alignClass, sideClass]
})

function toggleOpen() {
  open.value = !open.value
}

function closeOpen() {
  open.value = false
}

function onDocumentPointerDown(event: MouseEvent) {
  if (!open.value || !root.value) {
    return
  }

  const target = event.target as Node | null

  if (target && root.value.contains(target)) {
    return
  }

  closeOpen()
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentPointerDown)
})
</script>

<template>
  <div
    ref="root"
    v-bind="forwardedAttrs"
    class="relative inline-flex"
    :style="{ '--popover-offset': `${props.content?.sideOffset ?? 10}px` }"
  >
    <div class="inline-flex" @click.stop="toggleOpen">
      <slot />
    </div>

    <div
      v-if="open"
      class="absolute z-50"
      :class="popoverClass"
      @click.stop
    >
      <slot name="content" />
    </div>
  </div>
</template>
