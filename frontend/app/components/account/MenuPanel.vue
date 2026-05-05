<script setup lang="ts">
import type { AccountMenuItem } from '~/composables/useAccountMenuItems'

defineProps<{
  title: string
  subtitle: string
  items: AccountMenuItem[]
}>()
</script>

<template>
  <div class="vtx-account-panel">
    <div class="vtx-account-panel-hero">
      <slot name="avatar" />

      <div class="min-w-0">
        <p class="vtx-account-panel-title truncate">
          {{ title }}
        </p>
        <p class="vtx-account-panel-subtitle truncate">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <NuxtLink
      v-for="item in items"
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
