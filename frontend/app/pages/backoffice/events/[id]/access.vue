<script setup lang="ts">
definePageMeta({ layout: 'backoffice', middleware: 'access-stats' })
useSeoMeta({ title: 'Control de accesos | Backoffice VeriTix' })

const route = useRoute()
const eventId = computed(() => String(route.params.id || ''))

const { event } = useEventDetail(eventId)
const {
  snapshot,
  history,
  status,
  error,
  updatesReceived,
  isConnected,
  isConnecting,
  hasError,
  connect,
  disconnect,
} = useAccessStatsStream(eventId)

const eventName = computed(() => event.value?.name ?? '')
const isLoading = computed(() => !snapshot.value)

// ── Snapshot values ────────────────────────────────────────────────────────

const validated = computed(() => snapshot.value?.validated ?? 0)
const pending = computed(() => snapshot.value?.pending ?? 0)
const denied = computed(() => snapshot.value?.denied ?? 0)
const total = computed(() => snapshot.value?.total ?? 0)
const capacity = computed(() => snapshot.value?.capacity ?? 0)
const percentage = computed(() => snapshot.value?.percentage ?? 0)
const occupancy = computed(() => snapshot.value?.occupancy ?? 0)
const lastUpdated = computed(() => snapshot.value?.lastUpdated ?? null)

// ── Validation progress bar widths ─────────────────────────────────────────

const validatedPct = computed(() =>
  total.value > 0 ? (validated.value / total.value) * 100 : 0,
)
const deniedPct = computed(() =>
  total.value > 0 ? (denied.value / total.value) * 100 : 0,
)
const pendingPct = computed(() =>
  total.value > 0 ? (pending.value / total.value) * 100 : 0,
)

// ── Connection badge ───────────────────────────────────────────────────────

const connectionBadge = computed(() => {
  if (isConnected.value) { return { color: 'success' as const, label: 'En vivo' } }
  if (isConnecting.value) { return { color: 'warning' as const, label: 'Conectando…' } }
  if (hasError.value) { return { color: 'error' as const, label: 'Sin conexión' } }
  return { color: 'neutral' as const, label: 'Desconectado' }
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8" data-testid="backoffice-access-page">
        <!-- ── Hero header ───────────────────────────────────────────────── -->
        <div class="relative overflow-hidden rounded-2xl">
          <div v-if="event?.imageUrl" class="absolute inset-0">
            <img :src="event.imageUrl" class="size-full object-cover" alt="">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>
          <div class="relative px-6 py-8 sm:px-8 sm:py-10">
            <UiPageHeading
              eyebrow="Backoffice"
              :title="eventName ? `Accesos — ${eventName}` : 'Control de accesos'"
              description="Monitoreo de validaciones en tiempo real."
            >
              <template #actions>
                <div class="flex flex-wrap items-center gap-3">
                  <BaseButton
                    variant="secondary"
                    size="md"
                    trailing-icon="i-lucide-arrow-right"
                    to="/backoffice/events"
                  >
                    Volver
                  </BaseButton>

                  <div class="flex items-center gap-2 rounded-full border border-default/50 bg-elevated/60 px-3 py-1.5 backdrop-blur-sm">
                    <span
                      class="size-2 rounded-full"
                      :class="{
                        'bg-success animate-pulse': isConnected,
                        'bg-warning animate-pulse': isConnecting,
                        'bg-error': hasError,
                        'bg-muted': !isConnected && !isConnecting && !hasError,
                      }"
                    />
                    <BaseBadge kind="tag" size="xs" :color="connectionBadge.color">
                      {{ connectionBadge.label }}
                    </BaseBadge>
                  </div>

                  <BaseButton
                    v-if="hasError"
                    variant="outlined"
                    size="sm"
                    leading-icon="i-lucide-refresh-cw"
                    @click="connect()"
                  >
                    Reconectar
                  </BaseButton>
                  <BaseButton
                    v-else-if="isConnected"
                    variant="outlined"
                    size="sm"
                    leading-icon="i-lucide-wifi-off"
                    @click="disconnect()"
                  >
                    Pausar
                  </BaseButton>
                  <BaseButton
                    v-else-if="status === 'closed'"
                    variant="outlined"
                    size="sm"
                    leading-icon="i-lucide-wifi"
                    @click="connect()"
                  >
                    Reanudar
                  </BaseButton>
                </div>
              </template>
            </UiPageHeading>
          </div>
        </div>

        <!-- ── Activity pulse ────────────────────────────────────────────── -->
        <PagesBackofficeAccessActivityPulse
          :last-updated="lastUpdated"
          :updates-received="updatesReceived"
          :is-connected="isConnected"
          :is-connecting="isConnecting"
          :has-error="hasError"
        />

        <!-- ── KPI grid + occupancy ring ─────────────────────────────────── -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px]">
          <!-- KPI cards 2x2 -->
          <div class="grid grid-cols-2 gap-4">
            <PagesBackofficeAccessStatCard
              label="Validados"
              :value="validated"
              :hint="`${percentage}% del total`"
              icon="i-lucide-circle-check-big"
              tone="success"
              :loading="isLoading"
            />
            <PagesBackofficeAccessStatCard
              label="Pendientes"
              :value="pending"
              hint="sin escanear aún"
              icon="i-lucide-clock"
              tone="warning"
              :loading="isLoading"
            />
            <PagesBackofficeAccessStatCard
              label="Denegados"
              :value="denied"
              hint="cancelados / reembolsados"
              icon="i-lucide-ban"
              tone="error"
              :loading="isLoading"
            />
            <PagesBackofficeAccessStatCard
              label="Tickets totales"
              :value="total"
              hint="emitidos para este evento"
              icon="i-lucide-ticket"
              tone="primary"
              :loading="isLoading"
            />
          </div>

          <!-- Occupancy ring -->
          <PagesBackofficeAccessOccupancyRing
            :validated="validated"
            :capacity="capacity"
            :occupancy="occupancy"
            :loading="isLoading || capacity === 0"
          />
        </div>

        <!-- ── Validation progress bar ───────────────────────────────────── -->
        <UiPanel v-if="snapshot" variant="glass" radius="md" padding="md">
          <div class="mb-4 flex items-center gap-2">
            <BaseIcon name="i-lucide-bar-chart-3" class="size-4 text-toned" />
            <p class="text-sm font-medium text-highlighted">
              Distribución de tickets
            </p>
          </div>

          <div class="flex h-3 w-full overflow-hidden rounded-full bg-default/30">
            <div
              class="bg-success transition-all duration-700 ease-out"
              :style="{ width: `${validatedPct}%` }"
            />
            <div
              class="bg-error transition-all duration-700 ease-out"
              :style="{ width: `${deniedPct}%` }"
            />
            <div
              class="bg-warning/40 transition-all duration-700 ease-out"
              :style="{ width: `${pendingPct}%` }"
            />
          </div>

          <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
            <span class="flex items-center gap-1.5">
              <span class="inline-block size-2 rounded-full bg-success" />
              Validados: {{ validated }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="inline-block size-2 rounded-full bg-error" />
              Denegados: {{ denied }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="inline-block size-2 rounded-full bg-warning/60" />
              Pendientes: {{ pending }}
            </span>
          </div>
        </UiPanel>

        <!-- ── Sparkline ─────────────────────────────────────────────────── -->
        <PagesBackofficeAccessSparkline
          :history="history"
          :loading="isLoading"
        />

        <!-- ── Error state ───────────────────────────────────────────────── -->
        <UiPanel v-if="hasError" variant="glass" radius="md" padding="lg">
          <div class="flex flex-col items-center justify-center gap-4 py-6 text-center">
            <div class="flex size-12 items-center justify-center rounded-full border border-default bg-default/60 text-muted">
              <BaseIcon name="i-lucide-wifi-off" class="size-5" />
            </div>
            <div class="space-y-1.5">
              <p class="text-base font-semibold text-highlighted">
                Conexión interrumpida
              </p>
              <p class="max-w-sm text-sm leading-relaxed text-toned">
                {{ error ?? 'No se pudo mantener la conexión con el servidor.' }}
              </p>
            </div>
            <BaseButton
              variant="primary"
              size="sm"
              leading-icon="i-lucide-refresh-cw"
              @click="connect()"
            >
              Reconectar
            </BaseButton>
          </div>
        </UiPanel>
      </div>
    </BaseContainer>
  </section>
</template>
