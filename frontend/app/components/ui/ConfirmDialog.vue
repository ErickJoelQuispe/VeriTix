<script setup lang="ts">
import { useConfirmDialog } from '@/composables/ui/useConfirmDialog'

const { dialogState, resolveDialog } = useConfirmDialog()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      enter-active-class="transition-opacity duration-200"
    >
      <div
        v-if="dialogState.open"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="resolveDialog(false)"
      >
        <Transition
          enter-from-class="translate-y-4 scale-95 opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
          leave-from-class="translate-y-0 scale-100 opacity-100"
          leave-to-class="translate-y-4 scale-95 opacity-0"
          leave-active-class="transition-all duration-200"
          enter-active-class="transition-all duration-200"
        >
          <div
            v-if="dialogState.open"
            class="w-full max-w-sm rounded-2xl border border-default/65 bg-elevated p-6 shadow-[0_32px_64px_-32px_rgba(0,0,0,0.6)] ring-1 ring-white/5"
          >
            <div class="flex flex-col items-center gap-4 text-center">
              <div class="flex size-12 items-center justify-center rounded-full bg-warning/15">
                <BaseIcon name="i-lucide-triangle-alert" class="size-6 text-warning" />
              </div>

              <div class="space-y-1">
                <p class="text-base font-semibold text-highlighted">
                  {{ dialogState.title }}
                </p>
                <p class="text-sm leading-relaxed text-toned">
                  {{ dialogState.message }}
                </p>
              </div>
            </div>

            <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <BaseButton variant="outlined" size="md" class="w-full sm:w-auto" @click="resolveDialog(false)">
                {{ dialogState.cancelLabel }}
              </BaseButton>
              <BaseButton variant="danger" size="md" class="w-full sm:w-auto" @click="resolveDialog(true)">
                {{ dialogState.confirmLabel }}
              </BaseButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
