<script setup lang="ts">
import type { TicketType } from '~~/shared/types/domain'

const props = withDefaults(defineProps<{
  open: boolean
  initialValue?: Partial<TicketType>
}>(), {
  initialValue: undefined,
})

const emit = defineEmits<{
  confirm: [payload: {
    name: string
    description?: string
    price: number
    totalQuantity: number
    maxPerUser?: number
    isActive?: boolean
    saleStartDate?: string
    saleEndDate?: string
  }]
  cancel: []
}>()

const name = ref(props.initialValue?.name ?? '')
const description = ref(props.initialValue?.description ?? '')
const price = ref(props.initialValue?.price ?? 0)
const totalQuantity = ref(props.initialValue?.totalQuantity ?? 100)
const maxPerUser = ref(props.initialValue?.maxPerUser ?? 4)
const isActive = ref(props.initialValue?.isActive ?? true)
const saleStartDate = ref(props.initialValue?.saleStartDate ?? '')
const saleEndDate = ref(props.initialValue?.saleEndDate ?? '')

watch(() => props.open, (val) => {
  if (val) {
    name.value = props.initialValue?.name ?? ''
    description.value = props.initialValue?.description ?? ''
    price.value = props.initialValue?.price ?? 0
    totalQuantity.value = props.initialValue?.totalQuantity ?? 100
    maxPerUser.value = props.initialValue?.maxPerUser ?? 4
    isActive.value = props.initialValue?.isActive ?? true
    saleStartDate.value = props.initialValue?.saleStartDate ?? ''
    saleEndDate.value = props.initialValue?.saleEndDate ?? ''
  }
})

const isValid = computed(() => name.value.trim().length > 0 && price.value >= 0 && totalQuantity.value >= 1)

function handleConfirm() {
  if (!isValid.value) {
    return
  }

  emit('confirm', {
    name: name.value.trim(),
    description: description.value.trim() || undefined,
    price: Number(price.value),
    totalQuantity: Number(totalQuantity.value),
    maxPerUser: Number(maxPerUser.value) || undefined,
    isActive: isActive.value,
    saleStartDate: saleStartDate.value || undefined,
    saleEndDate: saleEndDate.value || undefined,
  })
}
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
        v-if="open"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="emit('cancel')"
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
            v-if="open"
            class="w-full max-w-lg rounded-2xl border border-default/65 bg-elevated p-6 shadow-[0_32px_64px_-32px_rgba(0,0,0,0.6)] ring-1 ring-white/5"
          >
            <div class="mb-5 flex items-center justify-between">
              <p class="text-base font-semibold text-highlighted">
                {{ initialValue ? 'Editar tipo de boleto' : 'Nuevo tipo de boleto' }}
              </p>
              <button
                type="button"
                class="flex size-8 items-center justify-center rounded-lg text-toned/50 transition-colors hover:bg-default/20 hover:text-highlighted"
                @click="emit('cancel')"
              >
                <BaseIcon name="i-lucide-x" class="size-5" />
              </button>
            </div>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-toned/70">Nombre</label>
                  <input
                    v-model="name"
                    type="text"
                    placeholder="General, VIP, Early Bird..."
                    class="w-full rounded-xl border border-default/55 bg-default/30 px-4 py-2.5 text-sm text-highlighted placeholder:text-toned/60 shadow-sm transition focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/35"
                  >
                </div>

                <div class="sm:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-toned/70">Descripción</label>
                  <textarea
                    v-model="description"
                    placeholder="Opcional — describí qué incluye este tipo de boleto"
                    rows="2"
                    class="w-full rounded-xl border border-default/55 bg-default/30 px-4 py-2.5 text-sm text-highlighted placeholder:text-toned/60 shadow-sm transition focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/35"
                  />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-toned/70">Precio (€)</label>
                  <input
                    v-model.number="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full rounded-xl border border-default/55 bg-default/30 px-4 py-2.5 text-sm text-highlighted placeholder:text-toned/60 shadow-sm transition focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/35"
                  >
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-toned/70">Cantidad total</label>
                  <input
                    v-model.number="totalQuantity"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="500"
                    class="w-full rounded-xl border border-default/55 bg-default/30 px-4 py-2.5 text-sm text-highlighted placeholder:text-toned/60 shadow-sm transition focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/35"
                  >
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-toned/70">Máx. por usuario</label>
                  <input
                    v-model.number="maxPerUser"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="4"
                    class="w-full rounded-xl border border-default/55 bg-default/30 px-4 py-2.5 text-sm text-highlighted placeholder:text-toned/60 shadow-sm transition focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/35"
                  >
                </div>

                <div class="flex items-center pt-5">
                  <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-default/50 bg-default/20 px-4 py-3 transition hover:border-lavender/30">
                    <input
                      v-model="isActive"
                      type="checkbox"
                      class="size-4 rounded border-default/50 bg-default/30 text-lavender focus:ring-lavender/30"
                    >
                    <span class="text-sm text-highlighted">Activo</span>
                  </label>
                </div>
              </div>

              <div class="border-t border-muted/15 pt-4">
                <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-toned/50">
                  Fechas de venta (opcional)
                </p>
                <div class="grid gap-4 sm:grid-cols-2">
                  <FormDateTimePicker
                    v-model="saleStartDate"
                    name="saleStartDate"
                    label="Inicio de venta"
                    size="md"
                  />

                  <FormDateTimePicker
                    v-model="saleEndDate"
                    name="saleEndDate"
                    label="Fin de venta"
                    size="md"
                  />
                </div>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-between gap-2 border-t border-muted/15 pt-4">
              <BaseButton variant="primary" size="md" :disabled="!isValid" @click="handleConfirm">
                {{ initialValue ? 'Guardar cambios' : 'Crear tipo' }}
              </BaseButton>
              <BaseButton variant="reversed" size="md" @click="emit('cancel')">
                Cancelar
              </BaseButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
