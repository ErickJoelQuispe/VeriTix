<script setup lang="ts">
definePageMeta({
  layout: 'validator',
  middleware: 'validator',
})

useSeoMeta({
  title: 'Panel Validador | VeriTix',
  description: 'Panel de validación de tickets en puerta.',
})

const router = useRouter()
const { state, result, submitPayload, reset } = useValidator()

const manualPayload = ref('')
const isSubmitting = computed(() => state.value === 'scanning')

async function handleManualSubmit() {
  const payload = manualPayload.value.trim()
  if (!payload) return
  await submitPayload(payload)
}

function handleScanAnother() {
  reset()
  manualPayload.value = ''
}

function goToScan() {
  void router.push('/validator/scan')
}

const isResultState = computed(() =>
  state.value === 'success'
  || state.value === 'already_used'
  || state.value === 'invalid'
  || state.value === 'not_found',
)
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="mx-auto max-w-2xl space-y-8">
        <UiPageHeading
          eyebrow="Validador"
          title="Panel Validador"
          description="Escaneá el QR del ticket en puerta o ingresá el código manualmente para validarlo."
        />

        <!-- Scan button -->
        <UiPanel variant="glass" radius="md" padding="md">
          <div class="flex flex-col items-center gap-4 py-4 text-center">
            <div class="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <BaseIcon name="i-lucide-scan-qr-code" class="size-8 text-primary" />
            </div>
            <div class="space-y-1">
              <p class="text-lg font-semibold text-highlighted">
                Escanear QR
              </p>
              <p class="text-sm text-muted">
                Usá la cámara del dispositivo para escanear el código QR del ticket.
              </p>
            </div>
            <BaseButton
              variant="primary"
              size="md"
              leading-icon="i-lucide-camera"
              @click="goToScan"
            >
              Escanear QR
            </BaseButton>
          </div>
        </UiPanel>

        <!-- Manual entry -->
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

        <!-- Inline result -->
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

              <BaseButton variant="outlined" size="sm" block @click="handleScanAnother">
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
