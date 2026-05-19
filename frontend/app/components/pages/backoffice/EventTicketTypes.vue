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
  <div class="border-t border-default/55 pt-6">
    <UiMetaLabel as="span">
      Tipos de boleto
    </UiMetaLabel>

    <div v-if="loading" class="mt-4 flex items-center gap-3 py-6">
      <BaseIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-lavender" />
      <span class="text-sm text-toned">Cargando tipos de boleto...</span>
    </div>

    <template v-else>
      <div v-if="ticketTypes.length > 0" class="mt-4 space-y-3">
        <div
          v-for="tt in ticketTypes"
          :key="tt.id"
          class="rounded-xl border border-default/50 bg-default/12 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="truncate text-sm font-semibold text-highlighted">
                  {{ tt.name }}
                </p>
                <span
                  class="shrink-0 rounded-md px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider"
                  :class="tt.isActive ? 'bg-success/15 text-success' : 'bg-toned/10 text-toned/60'"
                >
                  {{ tt.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <p v-if="tt.description" class="mt-0.5 text-xs text-toned/60">
                {{ tt.description }}
              </p>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <BaseButton variant="outlined" size="xs" @click="openEdit(tt)">
                <BaseIcon name="i-lucide-pencil" class="size-3.5" />
              </BaseButton>
              <button
                type="button"
                class="flex size-7 items-center justify-center rounded-lg text-toned/40 transition-colors hover:bg-error/15 hover:text-error"
                :disabled="disabled"
                :aria-label="`Eliminar ${tt.name}`"
                @click="removeTicketType(tt.id)"
              >
                <BaseIcon name="i-lucide-trash-2" class="size-3.5" />
              </button>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
            <div>
              <span class="text-toned/50">Precio</span>
              <p class="font-semibold text-highlighted">
                {{ formatPrice(tt.price) }}
              </p>
            </div>
            <div>
              <span class="text-toned/50">Disponibles</span>
              <p class="font-semibold text-highlighted">
                {{ tt.availableQuantity }} / {{ tt.totalQuantity }}
              </p>
            </div>
            <div>
              <span class="text-toned/50">Máx. por usuario</span>
              <p class="font-semibold text-highlighted">
                {{ tt.maxPerUser }}
              </p>
            </div>
            <div>
              <span class="text-toned/50">Venta</span>
              <p class="font-semibold text-highlighted">
                {{ formatDate(tt.saleStartDate) }} – {{ formatDate(tt.saleEndDate) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="mt-4 rounded-xl border border-dashed border-default/40 bg-default/10 px-4 py-8 text-center text-sm text-toned/60"
      >
        <BaseIcon name="i-lucide-ticket" class="mx-auto mb-2 size-8 text-toned/30" />
        <p>No hay tipos de boleto creados.</p>
      </div>
    </template>

    <div class="mt-4">
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

    <PagesBackofficeTicketTypeModal
      :open="modalOpen"
      :initial-value="editingItem"
      @confirm="handleConfirm"
      @cancel="modalOpen = false; editingId = ''; editingItem = undefined"
    />
  </div>
</template>
