<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { EventCatalogItem } from '~~/shared/types'
import { formatEventDate } from '@/utils/date-formatters'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  event: EventCatalogItem
  index?: number
  to?: RouteLocationRaw
}>(), {
  index: 0,
  to: undefined,
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const rootClass = computed(() => attrs.class)

const eventLink = computed<RouteLocationRaw>(() => {
  return props.to ?? `/events/${props.event.id}`
})

const eventDate = computed(() => {
  return formatEventDate(props.event.dateISO)
})

const eventTime = computed(() => {
  return new Date(props.event.dateISO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
})

const fallbackTone = computed(() => {
  return [`vtx-transmission-fallback--1`, `vtx-transmission-fallback--2`, `vtx-transmission-fallback--3`][props.index % 3]
})
</script>

<template>
  <NuxtLink
    v-bind="forwardedAttrs"
    :to="eventLink"
    :aria-label="`Abrir ${props.event.name}`"
    class="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    :class="rootClass"
  >
    <article class="flex h-full flex-col">
      <div class="vtx-transmission-media">
        <NuxtImg
          v-if="props.event.imageUrl"
          :src="props.event.imageUrl"
          :alt="`Imagen de ${props.event.name}`"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          width="900"
          height="1200"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          placeholder
        />

        <div
          v-else
          class="vtx-transmission-fallback"
          :class="fallbackTone"
          aria-hidden="true"
        />

        <div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
      </div>

      <div class="vtx-transmission-details">
        <h3 class="line-clamp-2 font-display text-2xl leading-none text-highlighted transition-colors duration-300 group-hover:text-primary">
          {{ props.event.name }}
        </h3>

        <p class="mt-2 line-clamp-1 text-sm leading-relaxed text-toned">
          {{ props.event.venue.city }}
          <span v-if="props.event.format">· {{ props.event.format.name }}</span>
        </p>

        <div class="mt-auto flex items-end justify-between pt-4">
          <div class="text-xs tracking-wide text-muted uppercase">
            <span>{{ eventDate }}</span>
            <span class="mx-1.5">·</span>
            <span>{{ eventTime }}</span>
          </div>

          <BaseButton
            :to="eventLink"
            variant="primary"
            size="sm"
            class="px-3.5"
          >
            Ver
          </BaseButton>
        </div>
      </div>
    </article>
  </NuxtLink>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-transmission-media {
  aspect-ratio: 4 / 3.5;
  @apply relative overflow-hidden rounded-t-sm;
}

.vtx-transmission-details {
  @apply flex flex-col p-5;
  background: oklch(0.16 0.015 270 / 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background-image:
    linear-gradient(oklch(0.28 0.015 270 / 0.08) 1px, transparent 1px),
    linear-gradient(90deg, oklch(0.28 0.015 270 / 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
}

.vtx-transmission-fallback {
  @apply absolute inset-0;
}

.vtx-transmission-fallback--1 {
  background:
    radial-gradient(circle at 20% 80%, rgb(240 100 127 / 0.28) 0%, transparent 40%),
    radial-gradient(circle at 78% 18%, rgb(44 189 230 / 0.16) 0%, transparent 34%),
    linear-gradient(135deg, rgb(21 28 40), rgb(30 38 56));
}

.vtx-transmission-fallback--2 {
  background:
    radial-gradient(circle at 80% 20%, rgb(44 189 230 / 0.24) 0%, transparent 42%),
    radial-gradient(circle at 25% 78%, rgb(239 170 71 / 0.16) 0%, transparent 30%),
    linear-gradient(135deg, rgb(20 28 42), rgb(28 34 52));
}

.vtx-transmission-fallback--3 {
  background:
    radial-gradient(circle at 50% 50%, rgb(239 170 71 / 0.22) 0%, transparent 42%),
    radial-gradient(circle at 15% 18%, rgb(240 100 127 / 0.14) 0%, transparent 28%),
    linear-gradient(135deg, rgb(18 26 39), rgb(29 37 55));
}
</style>
