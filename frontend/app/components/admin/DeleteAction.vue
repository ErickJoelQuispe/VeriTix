<script setup lang="ts">
withDefaults(defineProps<{
  itemLabel: string
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  pending?: boolean
  testId?: string
  triggerKind?: 'primary' | 'secondary' | 'tertiary'
  triggerClass?: string
}>(), {
  title: 'Confirmar eliminación',
  description: 'Esta acción no se puede deshacer.',
  confirmLabel: 'Eliminar',
  cancelLabel: 'Cancelar',
  pending: false,
  testId: '',
  triggerKind: 'tertiary',
  triggerClass: '',
})

const emit = defineEmits<{
  confirm: []
}>()

const open = ref(false)

function handleConfirm() {
  emit('confirm')
  open.value = false
}
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'end', side: 'top', sideOffset: 10 }">
    <BaseButton
      :kind="triggerKind"
      size="sm"
      :class="triggerClass || undefined"
      :disabled="pending"
      :data-testid="testId || undefined"
    >
      <slot>
        Eliminar
      </slot>
    </BaseButton>

    <template #content>
      <div class="vtx-admin-confirm-panel">
        <div class="space-y-2">
          <p class="text-sm font-semibold text-highlighted">
            {{ title }}
          </p>
          <p class="text-sm leading-relaxed text-toned">
            {{ description }}
            <span class="font-medium text-highlighted">{{ itemLabel }}</span>
            ?
          </p>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <BaseButton kind="tertiary" size="sm" :disabled="pending" @click="open = false">
            {{ cancelLabel }}
          </BaseButton>
          <BaseButton kind="primary" size="sm" :loading="pending" :disabled="pending" @click="handleConfirm">
            {{ confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-admin-confirm-panel {
  width: min(20rem, calc(100vw - 2rem));
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgb(137 154 186 / 0.18);
  background:
    linear-gradient(180deg, rgb(17 24 39 / 0.98), rgb(9 14 26 / 0.99)),
    linear-gradient(135deg, rgb(239 170 71 / 0.05), rgb(20 128 188 / 0.04));
  box-shadow:
    0 22px 46px -30px rgb(0 0 0 / 0.88),
    inset 0 1px 0 rgb(255 255 255 / 0.04);
}
</style>
