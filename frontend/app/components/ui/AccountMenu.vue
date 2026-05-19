<script setup lang="ts">
import type { AccountMenuItem } from '@/composables/ui/useAccountMenuItems'

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
  triggerSize?: 'lg' | 'xl'
}>(), {
  avatarSrc: undefined,
  align: 'end',
  side: 'bottom',
  sideOffset: 12,
  triggerLabel: '',
  triggerSize: 'lg',
})

const attrs = useAttrs()
const open = defineModel<boolean>('open', { default: false })
const route = useRoute()

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

function isActiveItem(to: string): boolean {
  if (route.path === to) {
    return true
  }

  if (to === '/users/me') {
    return false
  }

  return route.path.startsWith(`${to}/`)
}
</script>

<template>
  <BasePopover v-model:open="open" v-bind="forwardedAttrs" :content="popoverContent" :class="rootClass">
    <button
      type="button"
      class="vtx-account-trigger"
      :class="{ 'is-open': open }"
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

      <BaseIcon
        name="i-lucide-chevron-down"
        class="vtx-account-trigger-chevron"
        aria-hidden="true"
      />
    </button>

    <template #content>
      <div class="vtx-account-panel">
        <div class="relative space-y-4">
          <section class="vtx-account-panel-hero">
            <slot name="panelAvatar">
              <BaseAvatar
                :src="props.avatarSrc || undefined"
                :alt="props.avatarAlt"
                :text="props.avatarInitials"
                :size="triggerAvatarSize"
                class="vtx-account-avatar vtx-account-panel-avatar"
              />
            </slot>

            <div class="min-w-0 flex-1">
              <p class="vtx-account-panel-title truncate">
                {{ props.title }}
              </p>
              <p class="vtx-account-panel-subtitle truncate">
                {{ props.subtitle }}
              </p>
            </div>
          </section>

          <section class="vtx-account-panel-actions">
            <div class="vtx-account-panel-links">
              <NuxtLink
                v-for="item in props.items"
                :key="item.to"
                :to="item.to"
                class="vtx-account-panel-link"
                :class="isActiveItem(item.to) ? 'vtx-account-panel-link-active' : ''"
              >
                <BaseIcon :name="item.icon" class="vtx-account-panel-link-icon" aria-hidden="true" />

                <div class="min-w-0 flex-1">
                  <p class="vtx-account-panel-link-title">
                    {{ item.label }}
                  </p>
                  <p class="vtx-account-panel-link-subtitle truncate">
                    {{ item.description }}
                  </p>
                </div>

                <BaseIcon name="i-lucide-chevron-right" class="vtx-account-panel-link-arrow" aria-hidden="true" />
              </NuxtLink>
            </div>
          </section>
        </div>
      </div>
    </template>
  </BasePopover>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-account-trigger {
  @apply inline-flex cursor-pointer items-center gap-2 rounded-full px-2.5 py-2;
  border: 0;
  background: color-mix(in srgb, var(--color-elevated) 97%, black);
  border: 1px solid color-mix(in srgb, var(--color-toned) 7%, transparent);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.04),
    0 6px 14px -16px rgb(0 0 0 / 0.34);
  transition:
    background-color 0.16s ease-out,
    box-shadow 0.16s ease-out,
    transform 0.16s ease-out;
}

.vtx-account-trigger-chevron {
  width: 0.9rem;
  height: 0.9rem;
  color: color-mix(in srgb, var(--color-toned) 72%, transparent);
  transition: transform 0.18s ease-out, color 0.18s ease-out;
  opacity: 0.78;
}

.vtx-account-trigger.is-open .vtx-account-trigger-chevron {
  transform: rotate(180deg);
  color: var(--color-highlighted);
}

.vtx-account-trigger.is-open {
  background: color-mix(in srgb, var(--color-elevated) 98%, black);
  border-color: color-mix(in srgb, var(--color-accent) 8%, var(--color-toned) 12%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.05),
    0 0 0 1px color-mix(in srgb, var(--color-accent) 8%, transparent),
    0 8px 18px -18px rgb(0 0 0 / 0.38);
}

.vtx-account-trigger:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--color-primary) 28%, transparent),
    0 0 0 5px color-mix(in srgb, var(--color-primary) 8%, transparent),
    inset 0 0 0 1px rgb(255 255 255 / 0.04);
}

.vtx-account-trigger:hover {
  background: color-mix(in srgb, var(--color-elevated) 97%, black);
  border-color: color-mix(in srgb, var(--color-toned) 9%, transparent);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.05),
    0 8px 18px -18px rgb(0 0 0 / 0.34);
  transform: translateY(-1px);
}

.vtx-account-trigger:active {
  background: color-mix(in srgb, var(--color-elevated) 92%, black);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.05),
    0 5px 12px -14px rgb(0 0 0 / 0.3);
  transform: translateY(0);
}

.vtx-account-panel {
  position: relative;
  width: min(24.5rem, calc(100vw - 1rem));
  overflow: hidden;
  border-radius: 1.75rem;
  border: 1px solid color-mix(in srgb, var(--color-accent) 14%, rgb(255 255 255 / 0.08));
  background:
    radial-gradient(circle at 82% 12%, color-mix(in oklch, var(--color-accent) 16%, transparent) 0%, transparent 30%),
    radial-gradient(circle at 18% 96%, color-mix(in oklch, var(--color-secondary) 12%, transparent) 0%, transparent 36%),
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--color-elevated) 92%, black);
  box-shadow:
    0 34px 72px -48px rgb(0 0 0 / 0.88),
    inset 0 1px 0 rgb(255 255 255 / 0.055);
  backdrop-filter: blur(22px) saturate(1.08);
}

.vtx-account-panel-hero {
  @apply flex items-start gap-3 border-b px-5 py-4;
  border-bottom-color: color-mix(in srgb, var(--color-toned) 22%, transparent);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.02), transparent);
}

.vtx-account-panel-avatar {
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.08),
    0 8px 18px -14px rgb(0 0 0 / 0.85);
}

.vtx-account-panel-title {
  color: var(--color-highlighted);
  font-size: 0.95rem;
  font-weight: 600;
}

.vtx-account-panel-subtitle {
  margin-top: 0.16rem;
  color: color-mix(in srgb, var(--color-toned) 64%, transparent);
  font-size: 0.72rem;
}

.vtx-account-panel-actions {
  @apply px-2 pb-2;
}

.vtx-account-panel-links {
  display: grid;
  overflow: hidden;
  border-radius: 1.15rem;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.035), rgb(255 255 255 / 0.015));
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.05);
}

.vtx-account-panel-link {
  @apply flex w-full cursor-pointer items-center no-underline;
  gap: 0.72rem;
  padding: 0.94rem 1rem;
  border-radius: 0.95rem;
  border: 0;
  margin: 0.12rem 0.12rem 0;
  background: transparent;
  transition:
    background-color 0.12s ease-out,
    box-shadow 0.12s ease-out,
    transform 0.12s ease-out;
}

.vtx-account-panel-link:first-child {
  margin-top: 0.12rem;
}

.vtx-account-panel-link:hover {
  background: linear-gradient(90deg, color-mix(in oklch, var(--color-accent) 8%, transparent), rgb(255 255 255 / 0.05));
  transform: translateX(1px);
}

.vtx-account-panel-link-active {
  background: linear-gradient(90deg, color-mix(in oklch, var(--color-accent) 14%, transparent), rgb(255 255 255 / 0.08));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 18%, transparent),
    0 10px 22px -18px rgb(0 0 0 / 0.65);
}

.vtx-account-panel-link-active .vtx-account-panel-link-icon {
  color: color-mix(in srgb, var(--color-accent) 92%, white);
  opacity: 1;
}

.vtx-account-panel-link-active .vtx-account-panel-link-title {
  color: var(--color-highlighted);
}

.vtx-account-panel-link:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--color-primary) 35%, transparent),
    0 0 0 5px color-mix(in srgb, var(--color-primary) 8%, transparent);
}

.vtx-account-panel-link:active {
  background: rgb(255 255 255 / 0.07);
  transform: translateY(0);
}

.vtx-account-panel-link-icon {
  width: 0.92rem;
  height: 0.92rem;
  flex: none;
  color: color-mix(in srgb, var(--color-accent) 82%, white);
  opacity: 0.84;
}

.vtx-account-panel-link-title {
  color: var(--color-highlighted);
  font-size: 0.84rem;
  font-weight: 500;
}

.vtx-account-panel-link-subtitle {
  margin-top: 0.15rem;
  color: color-mix(in srgb, var(--color-toned) 64%, transparent);
  font-size: 0.69rem;
}

.vtx-account-panel-link-arrow {
  width: 0.82rem;
  height: 0.82rem;
  color: color-mix(in srgb, var(--color-toned) 52%, transparent);
  transition: transform 0.12s ease-out, color 0.12s ease-out, opacity 0.12s ease-out;
  opacity: 0.58;
}

.vtx-account-panel-link:hover .vtx-account-panel-link-arrow {
  transform: translateX(3px);
  opacity: 1;
  color: color-mix(in srgb, var(--color-accent) 72%, var(--color-highlighted));
}
</style>
