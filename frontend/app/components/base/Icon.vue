<script setup lang="ts">
import lucideIcons from '@iconify-json/lucide/icons.json'
import heroiconsIcons from '@iconify-json/heroicons/icons.json'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  name: string
}>()

const attrs = useAttrs()

type IconPack = typeof lucideIcons | typeof heroiconsIcons

const ICON_PACKS: Record<string, IconPack> = {
  lucide: lucideIcons,
  heroicons: heroiconsIcons,
}

const iconData = computed(() => {
  const match = props.name.match(/^i-([^-]+)-(.+)$/)

  if (!match) {
    return null
  }

  const [, collection, iconName] = match
  const pack = ICON_PACKS[collection]

  if (!pack) {
    return null
  }

  return pack.icons[iconName as keyof typeof pack.icons] ?? null
})

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const iconClass = computed(() => attrs.class)
</script>

<template>
  <svg
    v-if="iconData"
    v-bind="forwardedAttrs"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    class="inline-block align-middle leading-none"
    :class="iconClass"
    aria-hidden="true"
    focusable="false"
  >
    <g v-html="iconData.body" />
  </svg>
</template>
