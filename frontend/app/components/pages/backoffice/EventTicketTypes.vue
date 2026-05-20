<script setup lang="ts">
import type { TicketType } from '~~/shared/types/domain'
import { useTicketTypesRepository } from '@/repositories/ticketTypesRepository'

const props = withDefaults(defineProps<{
  eventId?: string
  disabled?: boolean
}>(), {
  eventId: undefined,
  disabled: false,
})

const { listByEvent, create, update, remove } = useTicketTypesRepository()

const ticketTypes = ref<TicketType[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const editingId = ref('')
const editingItem = ref<Partial<TicketType> | undefined>(undefined)
let pendingIdCounter = 0

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(cents)
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Sin fecha'
  }

  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function loadTicketTypes() {
  if (!props.eventId) {
    ticketTypes.value = []
    return
  }

  loading.value = true

  try {
    ticketTypes.value = await listByEvent(props.eventId)
  }
  finally {
    loading.value = false
  }
}

function openCreate() {
  editingItem.value = undefined
  modalOpen.value = true
}

function openEdit(item: TicketType) {
  editingId.value = item.id
  editingItem.value = {
    name: item.name,
    description: item.description ?? '',
    price: item.price,
    totalQuantity: item.totalQuantity,
    maxPerUser: item.maxPerUser,
    isActive: item.isActive,
    saleStartDate: item.saleStartDate ?? '',
    saleEndDate: item.saleEndDate ?? '',
  }
  modalOpen.value = true
}

async function handleConfirm(payload: Parameters<typeof create>[1]) {
  if (props.eventId) {
    try {
      if (editingId.value) {
        await update(props.eventId, editingId.value, payload)
      }
      else {
        await create(props.eventId, payload)
      }

      modalOpen.value = false
      editingId.value = ''
      editingItem.value = undefined
      await loadTicketTypes()
    }
    catch {
      // Error handled by apiRequest
    }
  }
  else {
    pendingIdCounter++

    const localEntry: TicketType = {
      id: `pending-${pendingIdCounter}`,
      name: payload.name,
      description: payload.description ?? null,
      price: payload.price,
      totalQuantity: payload.totalQuantity,
      availableQuantity: payload.totalQuantity,
      maxPerUser: payload.maxPerUser ?? 4,
      isActive: payload.isActive ?? true,
      saleStartDate: payload.saleStartDate ?? null,
      saleEndDate: payload.saleEndDate ?? null,
    }

    if (editingId.value) {
      const idx = ticketTypes.value.findIndex(t => t.id === editingId.value)

      if (idx >= 0) {
        ticketTypes.value[idx] = localEntry
      }
    }
    else {
      ticketTypes.value = [...ticketTypes.value, localEntry]
    }

    modalOpen.value = false
    editingId.value = ''
    editingItem.value = undefined
  }
}

async function removeTicketType(id: string) {
  if (props.eventId) {
    try {
      await remove(props.eventId, id)
      await loadTicketTypes()
    }
    catch {
      // Error handled by apiRequest
    }
  }
  else {
    ticketTypes.value = ticketTypes.value.filter(t => t.id !== id)
  }
}

const pendingTicketTypes = computed(() => {
  return ticketTypes.value.filter(t => String(t.id).startsWith('pending-'))
})

defineExpose({ pendingTicketTypes })

watch(() => props.eventId, (id) => {
  if (id) {
    loadTicketTypes()
  }
  else {
    ticketTypes.value = []
  }
}, { immediate: true })
</script>

<template>
  <div class="border-t border-muted/15 pt-6">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-base font-semibold text-highlighted sm:text-lg">
        Tipos de boleto
      </h3>

      <BaseButton
        variant="outlined"
        size="sm"
        leading-icon="i-lucide-plus"
        :disabled="disabled"
        @click="openCreate"
      >
        Agregar tipo de boleto
      </BaseButton>
    </div>

    <div v-if="loading" class="mt-4 flex items-center gap-3 rounded-xl border border-default/40 bg-default/10 px-5 py-6">
      <BaseIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-lavender" />
      <span class="text-sm text-toned">Cargando tipos de boleto...</span>
    </div>

    <template v-else>
      <div v-if="ticketTypes.length > 0" class="mt-4 space-y-3">
        <div
          v-for="tt in ticketTypes"
          :key="tt.id"
          class="group rounded-xl border border-default/50 bg-gradient-to-b from-default/12 to-default/6 p-5 shadow-sm transition hover:border-lavender/20 hover:shadow-md"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2.5">
                <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-lavender/15 to-accent/10">
                  <BaseIcon name="i-lucide-ticket" class="size-4 text-lavender" />
                </div>
                <div>
                  <p class="truncate text-sm font-semibold text-highlighted">
                    {{ tt.name }}
                  </p>
                  <p v-if="tt.description" class="mt-0.5 text-xs text-toned/60">
                    {{ tt.description }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <div class="text-right">
                <p class="text-lg font-bold tracking-tight text-highlighted">
                  {{ formatPrice(tt.price) }}
                </p>
                <span
                  class="inline-block rounded-md px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-widest"
                  :class="tt.isActive ? 'bg-success/12 text-success' : 'bg-toned/8 text-toned/60'"
                >
                  {{ tt.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="flex flex-col gap-1 pl-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  class="flex size-7 items-center justify-center rounded-lg border border-default/40 bg-default/15 text-toned/50 transition-colors hover:border-lavender/30 hover:bg-lavender/10 hover:text-lavender"
                  :disabled="disabled"
                  :aria-label="`Editar ${tt.name}`"
                  @click="openEdit(tt)"
                >
                  <BaseIcon name="i-lucide-pencil" class="size-3.5" />
                </button>
                <button
                  type="button"
                  class="flex size-7 items-center justify-center rounded-lg border border-default/40 bg-default/15 text-toned/40 transition-colors hover:border-error/30 hover:bg-error/12 hover:text-error"
                  :disabled="disabled"
                  :aria-label="`Eliminar ${tt.name}`"
                  @click="removeTicketType(tt.id)"
                >
                  <BaseIcon name="i-lucide-trash-2" class="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-default/40 bg-default/20 sm:grid-cols-4">
            <div class="bg-default/10 px-3.5 py-2.5">
              <p class="text-[0.6rem] font-semibold uppercase tracking-widest text-toned/50">
                Disponibles
              </p>
              <p class="mt-0.5 text-sm font-semibold text-highlighted">
                {{ tt.availableQuantity }} <span class="text-xs font-normal text-toned/50">/ {{ tt.totalQuantity }}</span>
              </p>
            </div>
            <div class="bg-default/10 px-3.5 py-2.5">
              <p class="text-[0.6rem] font-semibold uppercase tracking-widest text-toned/50">
                Por usuario
              </p>
              <p class="mt-0.5 text-sm font-semibold text-highlighted">
                {{ tt.maxPerUser }}
              </p>
            </div>
            <div class="bg-default/10 px-3.5 py-2.5 sm:col-span-2">
              <p class="text-[0.6rem] font-semibold uppercase tracking-widest text-toned/50">
                Venta
              </p>
              <p class="mt-0.5 text-sm font-semibold text-highlighted">
                {{ formatDate(tt.saleStartDate) }} <span class="text-xs font-normal text-toned/50">→</span> {{ formatDate(tt.saleEndDate) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-default/30 bg-default/8 px-4 py-10 text-center"
      >
        <div class="flex size-12 items-center justify-center rounded-full bg-lavender/10">
          <BaseIcon name="i-lucide-ticket" class="size-6 text-lavender/60" />
        </div>
        <div>
          <p class="text-sm font-medium text-highlighted">
            Sin tipos de boleto
          </p>
          <p class="mt-0.5 text-xs text-toned/60">
            Agregá el primer tipo de boleto para este evento.
          </p>
        </div>
      </div>
    </template>

    <PagesBackofficeTicketTypeModal
      :open="modalOpen"
      :initial-value="editingItem"
      @confirm="handleConfirm"
      @cancel="modalOpen = false; editingId = ''; editingItem = undefined"
    />
  </div>
</template>
