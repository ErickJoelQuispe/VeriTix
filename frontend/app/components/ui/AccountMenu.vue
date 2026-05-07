<script setup lang="ts">
import type { AccountMenuItem } from '~/composables/useAccountMenuItems'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  title: string
  subtitle: string
  items: AccountMenuItem[]
  avatarAlt: string
  avatarInitials: string
  avatarSrc?: string | null
  align?: 'start' | 'end'
  side?: 'top' | 'bottom'
  sideOffset?: number
  triggerLabel?: string
  triggerSize?: 'md' | 'lg'
}>(), {
  avatarSrc: undefined,
  align: 'end',
  side: 'bottom',
  sideOffset: 12,
  triggerLabel: '',
  triggerSize: 'md',
})

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const rootClass = computed(() => attrs.class)

const popoverContent = computed(() => ({
  align: props.align,
  side: props.side,
  sideOffset: props.sideOffset,
}))

const triggerAvatarSize = computed(() => props.triggerSize)
</script>

<template>
  <BasePopover v-bind="forwardedAttrs" :content="popoverContent" :class="rootClass">
    <button
      type="button"
      class="vtx-account-trigger"
      :aria-label="props.triggerLabel || `Abrir menú de ${props.avatarAlt}`"
    >
      <slot name="triggerAvatar">
        <BaseAvatar
          :src="props.avatarSrc || undefined"
          :alt="props.avatarAlt"
          :text="props.avatarInitials"
          :size="triggerAvatarSize"
          class="vtx-account-avatar"
        />
      </slot>
    </button>

    <template #content>
      <div class="vtx-account-panel">
        <div class="vtx-account-panel-hero">
          <slot name="panelAvatar">
            <BaseAvatar
              :src="props.avatarSrc || undefined"
              :alt="props.avatarAlt"
              :text="props.avatarInitials"
              size="lg"
              class="vtx-account-panel-avatar"
            />
          </slot>

          <div class="min-w-0">
            <p class="vtx-account-panel-title truncate">
              {{ props.title }}
            </p>
            <p class="vtx-account-panel-subtitle truncate">
              {{ props.subtitle }}
            </p>
          </div>
        </div>

        <NuxtLink
          v-for="item in props.items"
          :key="item.to"
          :to="item.to"
          class="vtx-account-panel-link"
        >
          <div class="vtx-account-panel-link-icon-wrap" aria-hidden="true">
            <BaseIcon :name="item.icon" class="vtx-account-panel-link-icon" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="vtx-account-panel-link-title">
              {{ item.label }}
            </p>
            <p class="vtx-account-panel-link-subtitle truncate">
              {{ item.description }}
            </p>
          </div>

          <BaseIcon name="i-lucide-arrow-up-right" class="vtx-account-panel-link-arrow" aria-hidden="true" />
        </NuxtLink>
      </div>
    </template>
  </BasePopover>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-account-trigger {
  @apply inline-flex cursor-pointer items-center justify-center rounded-full;
  padding: 0.14rem;
  border: 0;
  background: rgb(255 255 255 / 0.02);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.04),
    0 6px 14px -16px rgb(0 0 0 / 0.82);
  transition:
    background-color 0.12s ease-out,
    box-shadow 0.12s ease-out;
}

.vtx-account-trigger:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgb(239 170 71 / 0.28),
    0 0 0 5px rgb(239 170 71 / 0.07),
    inset 0 0 0 1px rgb(255 255 255 / 0.05);
}

.vtx-account-trigger:hover {
  background: rgb(255 255 255 / 0.04);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.06),
    0 8px 18px -18px rgb(0 0 0 / 0.84);
}

.vtx-account-trigger:active {
  background: rgb(255 255 255 / 0.055);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.04),
    0 4px 10px -16px rgb(0 0 0 / 0.78);
}

.vtx-account-avatar {
  background: linear-gradient(135deg, rgb(239 170 71 / 0.78), rgb(20 128 188 / 0.78));
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.08),
    0 8px 18px -14px rgb(0 0 0 / 0.85);
}

.vtx-account-panel {
  width: min(21rem, calc(100vw - 2rem));
  padding: 0.9rem;
  border-radius: 1.15rem;
  border: 1px solid color-mix(in srgb, var(--color-border-accented) 28%, transparent);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-default) 96%, black), color-mix(in srgb, var(--color-default) 88%, black)),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-primary) 6%, transparent),
      color-mix(in srgb, var(--color-secondary) 5%, transparent)
    );
  box-shadow:
    0 22px 46px -30px rgb(0 0 0 / 0.88),
    inset 0 1px 0 rgb(255 255 255 / 0.04);
}

.vtx-account-panel-hero {
  @apply flex items-center gap-3;
  margin-bottom: 0.8rem;
  padding: 0.2rem;
}

.vtx-account-panel-avatar {
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.08),
    0 10px 24px -16px rgb(0 0 0 / 0.9);
}

.vtx-account-panel-title {
  color: var(--color-highlighted);
  font-size: 0.9rem;
  font-weight: 600;
}

.vtx-account-panel-subtitle {
  color: color-mix(in srgb, var(--color-toned) 82%, transparent);
  font-size: 0.72rem;
  margin-top: 0.18rem;
}

.vtx-account-panel-link {
  @apply flex w-full cursor-pointer items-center no-underline;
  gap: 0.8rem;
  padding: 0.85rem 0.9rem;
  border-radius: 0.95rem;
  border: 1px solid color-mix(in srgb, var(--color-border-accented) 18%, transparent);
  background: linear-gradient(135deg, rgb(255 255 255 / 0.055), rgb(255 255 255 / 0.025));
  transition:
    border-color 0.12s ease-out,
    background-color 0.12s ease-out,
    box-shadow 0.12s ease-out;
}

.vtx-account-panel-link + .vtx-account-panel-link {
  margin-top: 0.55rem;
}

.vtx-account-panel-link:hover {
  border-color: color-mix(in srgb, var(--color-primary) 28%, transparent);
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-secondary) 7%, transparent));
  box-shadow: 0 14px 24px -24px color-mix(in srgb, var(--color-primary) 34%, transparent);
}

.vtx-account-panel-link:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--color-primary) 35%, transparent),
    0 0 0 5px color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.vtx-account-panel-link:active {
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 12%, transparent), color-mix(in srgb, var(--color-secondary) 9%, transparent));
}

.vtx-account-panel-link-icon-wrap {
  @apply inline-flex size-10 items-center justify-center rounded-xl;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 14%, transparent), color-mix(in srgb, var(--color-secondary) 10%, transparent));
  border: 1px solid rgb(255 255 255 / 0.07);
}

.vtx-account-panel-link-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary);
}

.vtx-account-panel-link-title {
  color: var(--color-highlighted);
  font-size: 0.82rem;
  font-weight: 600;
}

.vtx-account-panel-link-subtitle {
  color: color-mix(in srgb, var(--color-toned) 74%, transparent);
  font-size: 0.7rem;
  margin-top: 0.16rem;
}

.vtx-account-panel-link-arrow {
  width: 0.92rem;
  height: 0.92rem;
  color: color-mix(in srgb, var(--color-toned) 72%, transparent);
}
</style>
