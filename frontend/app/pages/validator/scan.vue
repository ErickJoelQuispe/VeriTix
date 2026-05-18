<script setup lang="ts">
definePageMeta({
  layout: 'validator',
  middleware: 'validator',
})

useSeoMeta({
  title: 'Escanear QR | Panel Validador | VeriTix',
  description: 'Escaneá el código QR del ticket con la cámara.',
})

const router = useRouter()
const { state, result, submitPayload, reset } = useValidator()

const videoRef = ref<HTMLVideoElement | null>(null)
// cameraError = fatal error that prevents camera from starting at all
const cameraError = ref<string | null>(null)
// scanError = transient read error shown as a toast-like message, video stays visible
const scanError = ref<string | null>(null)
const isScanning = ref(false)

// Camera reader instance — typed loosely to avoid SSR issues
let codeReader: { decodeFromVideoDevice: (deviceId: string | null, videoElement: HTMLVideoElement, callback: (result: unknown, err?: unknown) => void) => Promise<unknown> } | null = null
let stopFn: (() => void) | null = null

const isResultState = computed(() =>
  state.value === 'success'
  || state.value === 'already_used'
  || state.value === 'invalid'
  || state.value === 'not_found',
)

// Errors that are safe to ignore — not a real problem, just no QR detected yet
const IGNORED_ERRORS = new Set(['NotFoundException', 'ChecksumException', 'FormatException'])

// AES-GCM payload format: hex:hex:hex (iv:authTag:ciphertext)
const QR_PAYLOAD_REGEX = /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i

// Debounce: avoid firing on partial/noisy reads
let lastScannedText = ''
let scanDebounceTimer: ReturnType<typeof setTimeout> | null = null
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
    // Dynamic import — SSR safe: never runs on server
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    codeReader = new BrowserMultiFormatReader()

    await (codeReader as unknown as { decodeFromVideoDevice: (deviceId: string | null, videoElement: HTMLVideoElement, callback: (result: { getText: () => string } | null, err?: unknown) => void) => Promise<{ stop: () => void }> }).decodeFromVideoDevice(
      null,
      videoRef.value,
      (result, err) => {
        if (result) {
          const text = (result as { getText: () => string }).getText().trim()

          // Debounce: only process if same text confirmed twice within window
          if (text !== lastScannedText) {
            lastScannedText = text
            console.log('[QR]', JSON.stringify(text))
            if (scanDebounceTimer) clearTimeout(scanDebounceTimer)
            scanDebounceTimer = setTimeout(async () => {
              if (!isValidPayload(text)) {
                console.log('[QR] invalid format, ignored')
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
            // Real read error — show inline but keep video alive
            scanError.value = 'Error al leer el QR. Intentá de nuevo.'
          }
        }
      },
    ).then((controls: { stop: () => void }) => {
      stopFn = controls.stop.bind(controls)
      isScanning.value = true
      // Samsung/Chrome mobile fix: force play() after zxing assigns srcObject
      if (videoRef.value) {
        videoRef.value.play().catch(() => {
          // Autoplay policy — non-fatal, stream is still active
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
      // Ignore errors on cleanup
    }
    stopFn = null
  }

  // Also stop all media tracks on the video element
  if (videoRef.value?.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoRef.value.srcObject = null
  }

  isScanning.value = false
}

async function handleScanAnother() {
  scanError.value = null
  lastScannedText = ''
  if (scanDebounceTimer) {
    clearTimeout(scanDebounceTimer)
    scanDebounceTimer = null
  }
  reset()
  await startCamera()
}

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
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/validator"
            class="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-highlighted"
          >
            <BaseIcon name="i-lucide-arrow-left" class="size-4" />
            Volver
          </NuxtLink>
          <UiPageHeading
            title="Escanear QR"
            description="Apuntá la cámara al código QR del ticket."
          />
        </div>

        <!-- Camera scanner area -->
        <template v-if="!isResultState">
          <UiPanel variant="glass" radius="md" padding="md">
            <div class="space-y-4">
              <!-- Fatal camera error: can't start at all -->
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

              <!-- Video element — always mounted so zxing always has a DOM target -->
              <div :class="cameraError ? 'hidden' : 'relative overflow-hidden rounded-xl bg-black aspect-video'">
                <video
                  ref="videoRef"
                  class="h-full w-full object-cover"
                  autoplay
                  playsinline
                  muted
                />
                <!-- Scanning overlay -->
                <div v-if="isScanning" class="absolute inset-0 flex items-center justify-center">
                  <div class="size-48 rounded-2xl border-2 border-primary/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
                </div>
                <!-- Transient scan error — overlaid, video stays visible -->
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

        <!-- Result cards -->
        <template v-if="isResultState">
          <!-- Success -->
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

          <!-- already_used -->
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

          <!-- invalid -->
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

          <!-- not_found -->
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
