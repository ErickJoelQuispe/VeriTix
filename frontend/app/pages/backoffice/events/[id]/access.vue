<script setup lang="ts">
definePageMeta({ layout: 'backoffice', middleware: 'access-stats' })
useSeoMeta({ title: 'Control de accesos | Backoffice VeriTix' })

const route = useRoute()
const eventId = computed(() => String(route.params.id || ''))

const { event } = useEventDetail(eventId)
const {
  snapshot,
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

// ── Derived display values ─────────────────────────────────────────────────

const validated = computed(() => snapshot.value?.validated ?? 0)
const pending = computed(() => snapshot.value?.pending ?? 0)
const denied = computed(() => snapshot.value?.denied ?? 0)
const total = computed(() => snapshot.value?.total ?? 0)
const capacity = computed(() => snapshot.value?.capacity ?? 0)
const percentage = computed(() => snapshot.value?.percentage ?? 0)
const occupancy = computed(() => snapshot.value?.occupancy ?? 0)

const lastUpdatedLabel = computed(() => {
  if (!snapshot.value?.lastUpdated) return '—'
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(snapshot.value.lastUpdated))
})

// ── Progress bar widths (over tickets sold) ────────────────────────────────

const validatedPct = computed(() =>
  total.value > 0 ? (validated.value / total.value) * 100 : 0,
)
const deniedPct = computed(() =>
  total.value > 0 ? (denied.value / total.value) * 100 : 0,
)
const pendingPct = computed(() =>
  total.value > 0 ? (pending.value / total.value) * 100 : 0,
)

// ── Aforo progress (over venue capacity) ──────────────────────────────────

const capacityFillPct = computed(() =>
  capacity.value > 0 ? Math.min((validated.value / capacity.value) * 100, 100) : 0,
)

// ── Icon box tone helper ───────────────────────────────────────────────────

function iconBoxClass(tone: 'primary' | 'success' | 'warning' | 'error' | 'neutral') {
  const base = 'flex size-10 items-center justify-center rounded-lg border'
  const map = {
    primary: 'border-primary/20 bg-primary/10 text-primary',
    success: 'border-success/20 bg-success/10 text-success',
    warning: 'border-warning/20 bg-warning/10 text-warning',
    error: 'border-error/20 bg-error/10 text-error',
    neutral: 'border-default bg-default/60 text-muted',
  }
  return `${base} ${map[tone]}`
}

// ── Connection status badge ────────────────────────────────────────────────

const connectionBadge = computed(() => {
  if (isConnected.value) return { color: 'success' as const, label: 'En vivo' }
  if (isConnecting.value) return { color: 'warning' as const, label: 'Conectando…' }
  if (hasError.value) return { color: 'error' as const, label: 'Sin conexión' }
  return { color: 'neutral' as const, label: 'Desconectado' }
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8" data-testid="backoffice-access-page">

        <!-- ── Hero header ─────────────────────────────────────────────── -->
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
              action-label="Volver"
              action-to="/backoffice/events"
            >
              <template #actions>
                <div class="flex items-center gap-3">
                  <!-- Live status badge -->
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

                  <!-- Reconnect button on error -->
                  <BaseButton
                    v-if="hasError"
                    variant="outlined"
                    size="sm"
                    leading-icon="i-lucide-refresh-cw"
                    @click="connect()"
                  >
                    Reconectar
                  </BaseButton>

                  <!-- Disconnect / connect toggle -->
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

        <!-- ── KPI Cards ───────────────────────────────────────────────── -->
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <template v-if="!snapshot">
            <UiPanel v-for="i in 4" :key="i" variant="glass" radius="md" padding="md">
              <BaseSkeleton class="mb-4 size-10 rounded-lg" />
              <BaseSkeleton class="mb-2 h-8 w-16" />
              <BaseSkeleton class="h-4 w-24" />
            </UiPanel>
          </template>

          <template v-else>
            <!-- 1. Validated -->
            <UiPanel variant="glass" radius="md" padding="md">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-3">
                  <UiMetaLabel>Validados</UiMetaLabel>
                  <div class="space-y-1">
                    <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                      {{ validated }}
                    </p>
                    <p class="text-sm text-toned">
                      {{ percentage }}% del total
                    </p>
                  </div>
                </div>
                <div :class="iconBoxClass('success')">
                  <BaseIcon name="i-lucide-check-circle-2" class="size-5" />
                </div>
              </div>
            </UiPanel>

            <!-- 2. Pending -->
            <UiPanel variant="glass" radius="md" padding="md">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-3">
                  <UiMetaLabel>Pendientes</UiMetaLabel>
                  <div class="space-y-1">
                    <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                      {{ pending }}
                    </p>
                    <p class="text-sm text-toned">
                      sin escanear aún
                    </p>
                  </div>
                </div>
                <div :class="iconBoxClass('warning')">
                  <BaseIcon name="i-lucide-clock" class="size-5" />
                </div>
              </div>
            </UiPanel>

            <!-- 3. Denied -->
            <UiPanel variant="glass" radius="md" padding="md">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-3">
                  <UiMetaLabel>Denegados</UiMetaLabel>
                  <div class="space-y-1">
                    <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                      {{ denied }}
                    </p>
                    <p class="text-sm text-toned">
                      cancelados / reembolsados
                    </p>
                  </div>
                </div>
                <div :class="iconBoxClass('error')">
                  <BaseIcon name="i-lucide-ban" class="size-5" />
                </div>
              </div>
            </UiPanel>

            <!-- 4. Total tickets -->
            <UiPanel variant="glass" radius="md" padding="md">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-3">
                  <UiMetaLabel>Tickets totales</UiMetaLabel>
                  <div class="space-y-1">
                    <p class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                      {{ total }}
                    </p>
                    <p class="text-sm text-toned">
                      emitidos para este evento
                    </p>
                  </div>
                </div>
                <div :class="iconBoxClass('primary')">
                  <BaseIcon name="i-lucide-ticket" class="size-5" />
                </div>
              </div>
            </UiPanel>
          </template>
        </div>

        <!-- ── Validation progress bar ─────────────────────────────────── -->
        <UiPanel v-if="snapshot" variant="glass" radius="md" padding="md">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <BaseIcon name="i-lucide-bar-chart-3" class="size-4 text-toned" />
              <p class="text-sm font-medium text-highlighted">
                Progreso de validación
              </p>
            </div>
            <span class="text-xs text-muted">
              Actualizado a las {{ lastUpdatedLabel }}
            </span>
          </div>

          <!-- Segmented bar: validated / denied / pending -->
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

        <!-- ── Venue occupancy ─────────────────────────────────────────── -->
        <UiPanel v-if="snapshot && capacity > 0" variant="glass" radius="md" padding="md">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <BaseIcon name="i-lucide-building-2" class="size-4 text-toned" />
              <p class="text-sm font-medium text-highlighted">
                Aforo del venue
              </p>
            </div>
            <span class="text-sm font-semibold text-highlighted tabular-nums">
              {{ occupancy }}%
            </span>
          </div>

          <!-- Capacity bar -->
          <div class="h-3 w-full overflow-hidden rounded-full bg-default/30">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :class="{
                'bg-success': occupancy < 75,
                'bg-warning': occupancy >= 75 && occupancy < 90,
                'bg-error': occupancy >= 90,
              }"
              :style="{ width: `${capacityFillPct}%` }"
            />
          </div>

          <div class="mt-3 flex items-center justify-between text-xs text-muted">
            <span>{{ validated }} personas dentro</span>
            <span>Capacidad máxima: {{ capacity }}</span>
          </div>
        </UiPanel>

        <!-- ── Stream info panel ───────────────────────────────────────── -->
        <PagesBackofficeOverviewPanel
          eyebrow="Stream"
          title="Estado de la conexión"
          description="Información técnica del canal SSE activo."
          variant="glass"
        >
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div class="space-y-1">
              <p class="text-xs uppercase tracking-wide text-muted">
                Estado
              </p>
              <BaseBadge kind="status" size="sm" :color="connectionBadge.color">
                {{ connectionBadge.label }}
              </BaseBadge>
            </div>
            <div class="space-y-1">
              <p class="text-xs uppercase tracking-wide text-muted">
                Actualizaciones recibidas
              </p>
              <p class="text-sm font-semibold tabular-nums text-highlighted">
                {{ updatesReceived }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-xs uppercase tracking-wide text-muted">
                Última actualización
              </p>
              <p class="text-sm text-toned">
                {{ lastUpdatedLabel }}
              </p>
            </div>
            <div class="space-y-1">
              <p class="text-xs uppercase tracking-wide text-muted">
                Evento ID
              </p>
              <p class="font-mono text-xs text-muted">
                {{ eventId }}
              </p>
            </div>
          </div>

          <!-- Error state -->
          <UiEmptyState
            v-if="hasError"
            icon="i-lucide-wifi-off"
            title="Conexión interrumpida"
            :description="error ?? 'No se pudo mantener la conexión con el servidor.'"
            class="mt-4"
          >
            <template #action>
              <BaseButton
                variant="primary"
                size="sm"
                leading-icon="i-lucide-refresh-cw"
                @click="connect()"
              >
                Reconectar
              </BaseButton>
            </template>
          </UiEmptyState>
        </PagesBackofficeOverviewPanel>

      </div>
    </BaseContainer>
  </section>
</template>
