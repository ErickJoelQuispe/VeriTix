<script setup lang="ts">
definePageMeta({
  middleware: 'validator',
})

useSeoMeta({
  title: 'Validar entradas | VeriTix',
  description: 'Escaneá el QR del ticket o ingresá el código manualmente para validarlo.',
})

const { state, result, submitPayload, reset } = useValidator()

const videoRef = ref<HTMLVideoElement | null>(null)
const manualPayload = ref('')
const cameraError = ref<string | null>(null)
const scanError = ref<string | null>(null)
const isScanning = ref(false)

const isSubmitting = computed(() => state.value === 'scanning')
const isResultState = computed(() =>
  state.value === 'success'
  || state.value === 'already_used'
  || state.value === 'invalid'
  || state.value === 'not_found',
)

let stopFn: (() => void) | null = null
let lastScannedText = ''
let scanDebounceTimer: ReturnType<typeof setTimeout> | null = null

const IGNORED_ERRORS = new Set(['NotFoundException', 'ChecksumException', 'FormatException'])
const QR_PAYLOAD_REGEX = /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i
const SCAN_DEBOUNCE_MS = 300

function isValidPayload(text: string): boolean {
  return QR_PAYLOAD_REGEX.test(text.trim())
}

async function startCamera() {
  if (!videoRef.value) return

  cameraError.value = null
  scanError.value = null
  lastScannedText = ''

  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    const codeReader = new BrowserMultiFormatReader()

    await (codeReader as unknown as {
      decodeFromVideoDevice: (
        deviceId: string | null,
        videoElement: HTMLVideoElement,
        callback: (result: { getText: () => string } | null, err?: unknown) => void,
      ) => Promise<{ stop: () => void }>
    }).decodeFromVideoDevice(
      null,
      videoRef.value,
      (result, err) => {
        if (result) {
          const text = (result as { getText: () => string }).getText().trim()

          if (text !== lastScannedText) {
            lastScannedText = text
            if (scanDebounceTimer) clearTimeout(scanDebounceTimer)

            scanDebounceTimer = setTimeout(async () => {
              if (!isValidPayload(text)) {
                return
              }

              scanError.value = null
              await submitPayload(text)
            }, SCAN_DEBOUNCE_MS)
          }
        }
        else if (err) {
          const name = (err as { name?: string }).name ?? ''
          if (!IGNORED_ERRORS.has(name)) {
            scanError.value = 'Error al leer el QR. Intentá de nuevo.'
          }
        }
      },
    ).then((controls: { stop: () => void }) => {
      stopFn = controls.stop.bind(controls)
      isScanning.value = true

      if (videoRef.value) {
        videoRef.value.play().catch(() => {
          // Non-fatal autoplay restriction.
        })
      }
    }).catch(() => {
      cameraError.value = 'No se pudo acceder a la cámara. Verificá los permisos.'
      isScanning.value = false
    })
  }
  catch {
    cameraError.value = 'No se pudo cargar el escáner QR. Usá el ingreso manual.'
    isScanning.value = false
  }
}

function stopCamera() {
  if (scanDebounceTimer) {
    clearTimeout(scanDebounceTimer)
    scanDebounceTimer = null
  }

  lastScannedText = ''

  if (stopFn) {
    try {
      stopFn()
    }
    catch {
      // Ignore cleanup errors.
    }
    stopFn = null
  }

  if (videoRef.value?.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoRef.value.srcObject = null
  }

  isScanning.value = false
}

async function handleManualSubmit() {
  const payload = manualPayload.value.trim()
  if (!payload) return

  await submitPayload(payload)
}

function handleScanAnother() {
  stopCamera()
  reset()
  manualPayload.value = ''
  scanError.value = null
  lastScannedText = ''

  if (scanDebounceTimer) {
    clearTimeout(scanDebounceTimer)
    scanDebounceTimer = null
  }

  void startCamera()
}

watch(isResultState, (value) => {
  if (value) {
    stopCamera()
  }
})

onMounted(async () => {
  await startCamera()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="mx-auto max-w-2xl space-y-6">
        <UiPageHeading
          eyebrow="Validador"
          title="Validar entradas"
          description="Escaneá el QR del ticket o ingresá el código manualmente para validarlo."
        />

        <template v-if="!isResultState">
          <UiPanel variant="glass" radius="md" padding="md">
            <div class="space-y-4">
              <div v-if="cameraError" class="flex flex-col items-center gap-3 py-6 text-center">
                <div class="flex size-12 items-center justify-center rounded-xl border border-error/20 bg-error/10">
                  <BaseIcon name="i-lucide-camera-off" class="size-6 text-error" />
                </div>
                <p class="text-sm text-error">
                  {{ cameraError }}
                </p>
                <BaseButton variant="outlined" size="sm" @click="startCamera">
                  Reintentar
                </BaseButton>
              </div>

              <div :class="cameraError ? 'hidden' : 'relative overflow-hidden rounded-xl bg-black aspect-video'">
                <video
                  ref="videoRef"
                  class="h-full w-full object-cover"
                  autoplay
                  playsinline
                  muted
                />

                <div v-if="isScanning" class="absolute inset-0 flex items-center justify-center">
                  <div class="size-48 rounded-2xl border-2 border-primary/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
                </div>

                <div v-if="scanError" class="absolute bottom-2 left-2 right-2 rounded-lg bg-black/70 px-3 py-2 text-center text-xs text-error">
                  {{ scanError }}
                </div>
              </div>

              <p class="text-center text-xs text-muted">
                Centrá el código QR dentro del recuadro
              </p>
            </div>
          </UiPanel>
        </template>

        <UiPanel variant="glass" radius="md" padding="md">
          <div class="space-y-4">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-highlighted">
                Ingreso manual
              </p>
              <p class="text-sm text-muted">
                Pegá el payload del QR si no podés usar la cámara.
              </p>
            </div>

            <form class="space-y-3" @submit.prevent="handleManualSubmit">
              <FormField
                v-model="manualPayload"
                name="manual-payload"
                label="Payload del ticket"
                placeholder="Pegá el payload del QR aquí..."
                :disabled="isSubmitting"
              />

              <BaseButton
                type="submit"
                variant="secondary"
                size="md"
                block
                :loading="isSubmitting"
                :disabled="!manualPayload.trim() || isSubmitting"
                leading-icon="i-lucide-check-circle"
              >
                Validar ticket
              </BaseButton>
            </form>
          </div>
        </UiPanel>

        <template v-if="isResultState">
          <UiPanel v-if="state === 'success'" variant="glass" radius="md" padding="md" class="border border-success/30 bg-success/5">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-lg border border-success/20 bg-success/10">
                  <BaseIcon name="i-lucide-circle-check-big" class="size-5 text-success" />
                </div>
                <p class="text-lg font-semibold text-success">
                  Ticket válido
                </p>
              </div>

              <div v-if="result" class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted">Evento</span>
                  <span class="font-medium text-highlighted">{{ result.eventName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Tipo de ticket</span>
                  <span class="font-medium text-highlighted">{{ result.ticketTypeName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Comprador</span>
                  <span class="font-medium text-highlighted">{{ result.buyerName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Validado</span>
                  <span class="font-medium text-highlighted">{{ new Date(result.validatedAt).toLocaleString('es-ES') }}</span>
                </div>
              </div>

              <BaseButton variant="primary" size="md" block leading-icon="i-lucide-scan-qr-code" @click="handleScanAnother">
                Escanear otro
              </BaseButton>
            </div>
          </UiPanel>

          <UiPanel v-else-if="state === 'already_used'" variant="glass" radius="md" padding="md" class="border border-error/30 bg-error/5">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-lg border border-error/20 bg-error/10">
                  <BaseIcon name="i-lucide-circle-x" class="size-5 text-error" />
                </div>
                <p class="text-lg font-semibold text-error">
                  Ticket ya utilizado
                </p>
              </div>

              <BaseButton variant="outlined" size="sm" block @click="handleScanAnother">
                Escanear otro
              </BaseButton>
            </div>
          </UiPanel>

          <UiPanel v-else-if="state === 'invalid'" variant="glass" radius="md" padding="md" class="border border-warning/30 bg-warning/5">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-lg border border-warning/20 bg-warning/10">
                  <BaseIcon name="i-lucide-triangle-alert" class="size-5 text-warning" />
                </div>
                <p class="text-lg font-semibold text-warning">
                  QR inválido
                </p>
              </div>

              <BaseButton variant="outlined" size="sm" block @click="handleScanAnother">
                Escanear otro
              </BaseButton>
            </div>
          </UiPanel>

          <UiPanel v-else-if="state === 'not_found'" variant="glass" radius="md" padding="md" class="border border-error/30 bg-error/5">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-lg border border-error/20 bg-error/10">
                  <BaseIcon name="i-lucide-search-x" class="size-5 text-error" />
                </div>
                <p class="text-lg font-semibold text-error">
                  Ticket no encontrado
                </p>
              </div>

              <BaseButton variant="outlined" size="sm" block @click="handleScanAnother">
                Escanear otro
              </BaseButton>
            </div>
          </UiPanel>
        </template>
      </div>
    </BaseContainer>
  </section>
</template>
