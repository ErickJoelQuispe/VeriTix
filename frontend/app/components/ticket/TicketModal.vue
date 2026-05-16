<script setup lang="ts">
import type { UserTicket, UserTicketDetail } from '~~/shared/types'

const props = defineProps<{
  ticket: UserTicket | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'transfer-initiated': []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const { fetchTicketDetail } = useMyTickets()

const detail = ref<UserTicketDetail | null>(null)
const isLoadingDetail = ref(false)
const qrDataUrl = ref<string | null>(null)
const showTransferForm = ref(false)

async function loadDetail() {
  if (!props.ticket) return
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

const truncatedHash = computed(() =>
  props.ticket ? `${props.ticket.hash.slice(0, 4)}-${props.ticket.hash.slice(4, 8)}` : '',
)

const statusBadgeColor = computed(() => {
  if (!props.ticket) return 'neutral' as const
  const map = {
    ACTIVE: 'success' as const,
    USED: 'neutral' as const,
    CANCELLED: 'error' as const,
    REFUNDED: 'warning' as const,
  }
  return map[props.ticket.status]
})

const statusBadgeLabel = computed(() => {
  if (!props.ticket) return ''
  const map = {
    ACTIVE: 'Activo',
    USED: 'Usado',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
  }
  return map[props.ticket.status]
})

const formattedValidatedAt = computed(() => {
  if (!detail.value?.validatedAt) return null
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(detail.value.validatedAt))
})

function handleDownloadPdf() {
  if (!props.ticket) return
  window.open(`/api/tickets/${props.ticket.id}/pdf`, '_blank')
}

function handleTransferSuccess() {
  showTransferForm.value = false
  emit('transfer-initiated')
  emit('update:open', false)
}
</script>

<template>
  <UModal v-model:open="isOpen" :title="ticket?.ticketType.name ?? 'Entrada'">
    <template #body>
      <div class="flex flex-col items-center gap-5 py-2">
        <!-- QR Code (client-only — not SSR safe) -->
        <ClientOnly>
          <div class="flex items-center justify-center">
            <img
              v-if="qrDataUrl"
              :src="qrDataUrl"
              alt="QR de la entrada"
              class="size-[200px] rounded-xl"
              width="200"
              height="200"
            />
            <BaseSkeleton v-else class="size-[200px] rounded-xl" />
          </div>

          <template #fallback>
            <BaseSkeleton class="size-[200px] rounded-xl" />
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

        <!-- Hash -->
        <p class="font-mono text-sm text-muted">
          Hash: {{ truncatedHash }}
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
    </template>
  </UModal>
</template>
