<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  text?: string
  size?: 'lg' | 'xl'
}>(), {
  src: undefined,
  alt: undefined,
  text: undefined,
  size: 'lg',
})

const attrs = useAttrs()
const imageFailed = ref(false)
const WHITESPACE_REGEX = /\s+/

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const avatarClass = computed(() => attrs.class)

const gradientVariants = [
  'bg-[radial-gradient(circle_at_22%_18%,color-mix(in_oklch,var(--color-default)_82%,white)_0%,transparent_54%),linear-gradient(145deg,color-mix(in_oklch,var(--color-lavender)_78%,var(--color-elevated))_0%,color-mix(in_oklch,var(--color-accent)_74%,var(--color-default))_100%)]',
  'bg-[radial-gradient(circle_at_80%_20%,color-mix(in_oklch,var(--color-default)_84%,white)_0%,transparent_56%),linear-gradient(150deg,color-mix(in_oklch,var(--color-secondary)_72%,var(--color-elevated))_0%,color-mix(in_oklch,var(--color-lavender)_80%,var(--color-default))_100%)]',
  'bg-[radial-gradient(circle_at_24%_80%,color-mix(in_oklch,var(--color-default)_80%,white)_0%,transparent_58%),linear-gradient(148deg,color-mix(in_oklch,var(--color-accent)_72%,var(--color-elevated))_0%,color-mix(in_oklch,var(--color-lavender)_76%,var(--color-default))_100%)]',
] as const

const sizeClass = computed(() => {
  const sizes = {
    lg: 'size-12 text-base',
    xl: 'size-14 text-lg',
  }

  return sizes[props.size]
})

const canRenderImage = computed(() => Boolean(props.src) && !imageFailed.value)

const fallbackSeed = computed(() => (props.text || props.alt || '?').trim())

const fallbackGradientClass = computed(() => {
  const seed = fallbackSeed.value
  let hash = 0

  for (let index = 0; index < seed.length; index++) {
    hash = (hash * 33 + seed.charCodeAt(index)) | 0
  }

  const normalized = Math.abs(hash) % gradientVariants.length
  return gradientVariants[normalized]
})

const initials = computed(() => {
  const source = (props.text || props.alt || '').trim()

  if (!source) {
    return '?'
  }

  const words = source
    .split(WHITESPACE_REGEX)
    .map(word => word.trim())
    .filter(Boolean)

  if (words.length >= 2) {
    const [first = '', second = ''] = words
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
})

function handleImageError() {
  imageFailed.value = true
}

watch(() => props.src, () => {
  imageFailed.value = false
})
</script>

<template>
  <div
    v-bind="forwardedAttrs"
    class="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-default/70 text-highlighted shadow-sm ring-1 ring-white/10"
    :class="[canRenderImage ? 'bg-elevated/55' : fallbackGradientClass, sizeClass, avatarClass]"
  >
    <span
      v-if="!canRenderImage"
      class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0.06)_38%,rgba(0,0,0,0.2)_100%)]"
      aria-hidden="true"
    />

    <img
      v-if="canRenderImage"
      :src="props.src"
      :alt="props.alt || props.text || 'Avatar'"
      class="size-full object-cover"
      loading="lazy"
      decoding="async"
      @error="handleImageError"
    >
    <span v-else class="relative z-1 font-semibold uppercase leading-none tracking-[0.06em] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]">
      {{ initials }}
    </span>
  </div>
</template>
