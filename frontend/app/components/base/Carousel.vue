<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  items: unknown[]
  arrows?: boolean
  dots?: boolean
  ui?: Record<string, string>
}>(), {
  arrows: false,
  dots: false,
  ui: undefined,
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const carouselClass = computed(() => attrs.class)

const itemClass = computed(() => props.ui?.item ?? 'basis-[86%] ps-4 sm:basis-[48%]')
</script>

<template>
  <div v-bind="forwardedAttrs" :class="carouselClass">
    <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
      <div
        v-for="(item, index) in props.items"
        :key="index"
        class="shrink-0 snap-start" :class="[itemClass]"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>
