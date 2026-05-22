<script setup lang="ts">
import type { UserTicket, UserTicketDetail } from '~~/shared/types'

const props = defineProps<{
  ticket: UserTicket | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'transferInitiated': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const { fetchTicketDetail } = useMyTickets()

const detail = ref<UserTicketDetail | null>(null)
const isLoadingDetail = ref(false)
const qrDataUrl = ref<string | null>(null)
const showTransferForm = ref(false)

async function loadDetail() {
  if (!props.ticket) { return }
  isLoadingDetail.value = true
  qrDataUrl.value = null
  detail.value = null

  try {
    detail.value = await fetchTicketDetail(props.ticket.id)
  }
  finally {
    isLoadingDetail.value = false
  }
}

async function generateQr(payload: string) {
  const QRCode = await import('qrcode')
  qrDataUrl.value = await QRCode.default.toDataURL(payload, { width: 200, margin: 2 })
}

async function openAndLoad() {
  showTransferForm.value = false
  await loadDetail()
  if (detail.value?.qrPayload) {
    await generateQr(detail.value.qrPayload)
  }
}

watch(
  () => props.open,
  async (opened) => {
    if (opened && props.ticket) {
      await openAndLoad()
    }
  },
)

// Also load if modal starts already open (e.g. during tests)
onMounted(async () => {
  if (props.open && props.ticket) {
    await openAndLoad()
  }
})

const truncatedHash = computed(() => {
  if (!props.ticket) { return '' }
  const clean = props.ticket.id.replace(/-/g, '')
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`.toUpperCase()
})

const statusBadgeColor = computed(() => {
  if (!props.ticket) { return 'neutral' as const }
  const map = {
    ACTIVE: 'success' as const,
    USED: 'neutral' as const,
    CANCELLED: 'error' as const,
    REFUNDED: 'warning' as const,
  }
  return map[props.ticket.status]
})

const statusBadgeLabel = computed(() => {
  if (!props.ticket) { return '' }
  const map = {
    ACTIVE: 'Activo',
    USED: 'Usado',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
  }
  return map[props.ticket.status]
})

const formattedValidatedAt = computed(() => {
  if (!detail.value?.validatedAt) { return null }
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(detail.value.validatedAt))
})

function handleDownloadPdf() {
  if (!props.ticket) { return }
  window.open(`/api/tickets/${props.ticket.id}/pdf`, '_blank')
}

function handleTransferSuccess() {
  showTransferForm.value = false
  emit('transferInitiated')
  emit('update:open', false)
}
</script>

<template>
  <!-- Overlay backdrop -->
  <Teleport to="body">
    <Transition name="vtx-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="isOpen = false"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-default/80 backdrop-blur-sm" @click="isOpen = false" />

        <!-- Panel -->
        <UiPanel
          variant="glass"
          padding="xl"
          radius="xl"
          class="relative z-10 w-full max-w-sm"
        >
          <!-- Header -->
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-highlighted">
              {{ ticket?.ticketType.name ?? 'Entrada' }}
            </h2>
            <BaseButton
              variant="outlined"
              size="xs"
              leading-icon="i-lucide-x"
              @click="isOpen = false"
            >
              <span class="sr-only">Cerrar</span>
            </BaseButton>
          </div>

          <div class="flex flex-col items-center gap-5">
            <!-- QR Code (client-only — not SSR safe) -->
            <ClientOnly>
              <div class="flex items-center justify-center">
                <img
                  v-if="qrDataUrl"
                  :src="qrDataUrl"
                  alt="QR de la entrada"
                  class="size-50 rounded-xl"
                  width="200"
                  height="200"
                >
                <BaseSpinner v-else class="size-50 rounded-xl" />
              </div>
              <template #fallback>
                <BaseSpinner class="size-50 rounded-xl" />
              </template>
            </ClientOnly>

            <!-- Status and ticket type -->
            <div class="flex items-center gap-3">
              <BaseBadge kind="status" size="sm" :color="statusBadgeColor">
                {{ statusBadgeLabel }}
              </BaseBadge>
              <span class="text-sm font-semibold text-highlighted">
                {{ ticket?.ticketType.name }}
              </span>
            </div>

            <!-- Ticket ref -->
            <p class="font-mono text-sm text-muted">
              Ticket #{{ truncatedHash }}
            </p>

            <!-- Validated info (USED only) -->
            <div
              v-if="ticket?.status === 'USED' && detail"
              class="w-full rounded-xl border border-default/65 bg-elevated/45 px-4 py-3 text-sm"
            >
              <p class="text-toned">
                Validado: <span class="font-medium text-highlighted">{{ formattedValidatedAt ?? '—' }}</span>
              </p>
              <p v-if="detail.validatedBy" class="mt-1 text-toned">
                Por: <span class="font-medium text-highlighted">{{ detail.validatedBy.name }} {{ detail.validatedBy.lastName }}</span>
              </p>
            </div>

            <!-- Transfer form (ACTIVE only) -->
            <template v-if="ticket?.status === 'ACTIVE'">
              <div v-if="showTransferForm" class="w-full">
                <TicketTransferForm
                  :ticket-id="ticket.id"
                  @success="handleTransferSuccess"
                  @cancel="showTransferForm = false"
                />
              </div>

              <div v-else class="flex w-full items-center gap-3">
                <BaseButton
                  variant="outlined"
                  size="sm"
                  leading-icon="i-lucide-download"
                  class="flex-1"
                  @click="handleDownloadPdf"
                >
                  Descargar PDF
                </BaseButton>

                <BaseButton
                  variant="secondary"
                  size="sm"
                  leading-icon="i-lucide-send"
                  class="flex-1"
                  @click="showTransferForm = true"
                >
                  Transferir
                </BaseButton>
              </div>
            </template>
          </div>
        </UiPanel>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vtx-modal-enter-active,
.vtx-modal-leave-active {
  transition: opacity 0.2s ease;
}
.vtx-modal-enter-from,
.vtx-modal-leave-to {
  opacity: 0;
}
</style>
