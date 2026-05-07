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
const open = defineModel<boolean>('open', { default: false })

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

      <div class="vtx-account-trigger-copy hidden min-w-0 flex-1 sm:block">
        <p class="vtx-account-trigger-title truncate">
          {{ props.title }}
        </p>
        <p class="vtx-account-trigger-subtitle truncate">
          {{ props.subtitle }}
        </p>
      </div>

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
  @apply inline-flex cursor-pointer items-center gap-3 rounded-full px-2.5 py-1.5;
  border: 0;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.03)),
    color-mix(in srgb, var(--color-default) 88%, black);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.05),
    0 12px 24px -22px rgb(0 0 0 / 0.74);
  transition:
    background-color 0.16s ease-out,
    box-shadow 0.16s ease-out,
    transform 0.16s ease-out;
}

.vtx-account-trigger-copy {
  @apply min-w-0 text-left;
}

.vtx-account-trigger-title {
  color: var(--color-highlighted);
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.1;
}

.vtx-account-trigger-subtitle {
  margin-top: 0.12rem;
  color: color-mix(in srgb, var(--color-toned) 68%, transparent);
  font-size: 0.68rem;
  line-height: 1.1;
}

.vtx-account-trigger-chevron {
  width: 0.9rem;
  height: 0.9rem;
  color: color-mix(in srgb, var(--color-toned) 72%, transparent);
  transition: transform 0.18s ease-out, color 0.18s ease-out;
}

.vtx-account-trigger.is-open .vtx-account-trigger-chevron {
  transform: rotate(180deg);
  color: var(--color-highlighted);
}

.vtx-account-trigger:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgb(239 170 71 / 0.28),
    0 0 0 5px rgb(239 170 71 / 0.07),
    inset 0 0 0 1px rgb(255 255 255 / 0.05);
}

.vtx-account-trigger:hover {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.04)),
    color-mix(in srgb, var(--color-default) 86%, black);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.07),
    0 18px 30px -24px rgb(0 0 0 / 0.82);
  transform: translateY(-1px);
}

.vtx-account-trigger:active {
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.07), rgb(255 255 255 / 0.04)),
    color-mix(in srgb, var(--color-default) 86%, black);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.05),
    0 8px 18px -20px rgb(0 0 0 / 0.72);
  transform: translateY(0);
}

.vtx-account-avatar {
  background: linear-gradient(135deg, rgb(239 170 71 / 0.78), rgb(20 128 188 / 0.78));
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.08),
    0 8px 18px -14px rgb(0 0 0 / 0.85);
}

.vtx-account-panel {
  position: relative;
  width: min(24rem, calc(100vw - 1rem));
  overflow: hidden;
  border-radius: 1.5rem;
  border: 1px solid rgb(255 255 255 / 0.08);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.03), rgb(255 255 255 / 0.01)),
    color-mix(in srgb, var(--color-elevated) 94%, black);
  box-shadow:
    0 28px 60px -40px rgb(0 0 0 / 0.84),
    inset 0 1px 0 rgb(255 255 255 / 0.045);
  backdrop-filter: blur(20px) saturate(1.04);
}

.vtx-account-panel-hero {
  @apply flex items-start gap-3 border-b border-default/50 px-4 pb-4 pt-4;
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
  border-radius: 1.2rem;
  background: rgb(255 255 255 / 0.024);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.05);
}

.vtx-account-panel-link {
  @apply flex w-full cursor-pointer items-center no-underline;
  gap: 0.72rem;
  padding: 0.84rem 0.96rem;
  border-radius: 0;
  border: 0;
  border-bottom: 1px solid rgb(255 255 255 / 0.06);
  background: transparent;
  transition:
    background-color 0.12s ease-out,
    box-shadow 0.12s ease-out,
    transform 0.12s ease-out;
}

.vtx-account-panel-link:last-child {
  border-bottom: 0;
}

.vtx-account-panel-link:hover {
  background: rgb(255 255 255 / 0.05);
  transform: translateX(1px);
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
  color: color-mix(in srgb, var(--color-primary) 86%, white);
  opacity: 0.78;
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
  color: var(--color-highlighted);
}
</style>
