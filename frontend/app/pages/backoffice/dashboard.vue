<script setup lang="ts">
import type {
  BackofficeEventRecord,
} from '~/types'
import { useBackofficeEventsRepository } from '~/repositories/backofficeEventsRepository'

definePageMeta({
  middleware: 'backoffice',
})

useSeoMeta({
  title: 'Dashboard | Backoffice VeriTix',
  description: 'Dashboard operativo de eventos en VeriTix.',
})

const { listCatalog } = useBackofficeEventsRepository()
const { notifyApiError } = useAppNotifications()

const events = ref<BackofficeEventRecord[]>([])
const pending = ref(true)

const metrics = computed(() => {
  const scheduledEvents = events.value.filter(event => new Date(event.eventDate).getTime() >= Date.now()).length
  const draftEvents = events.value.filter(event => event.status === 'DRAFT').length
  const cancelledEvents = events.value.filter(event => event.status === 'CANCELLED').length

  return [
    {
      label: 'Eventos',
      value: events.value.length,
      hint: `${scheduledEvents} próximos`,
      icon: 'i-lucide-calendar',
      variant: 'warning' as const,
    },
    {
      label: 'Borradores',
      value: draftEvents,
      hint: draftEvents > 0 ? 'pendientes de publicar' : 'sin bloqueos de publicación',
      icon: 'i-lucide-file-pen-line',
      variant: draftEvents > 0 ? 'warning' as const : 'success' as const,
    },
    {
      label: 'Atención',
      value: cancelledEvents,
      hint: cancelledEvents > 0 ? 'eventos cancelados' : 'sin incidencias críticas',
      icon: 'i-lucide-alert-circle',
      variant: cancelledEvents > 0 ? 'error' as const : 'default' as const,
    },
  ]
})

const upcomingEvents = computed(() => {
  return [...events.value]
    .sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime())
    .slice(0, 5)
})

const attentionQueue = computed(() => {
  const scheduledEvents = events.value.filter(event => new Date(event.eventDate).getTime() >= Date.now()).length
  const draftEvents = events.value.filter(event => event.status === 'DRAFT').length
  const cancelledEvents = events.value.filter(event => event.status === 'CANCELLED').length
  const pastEvents = events.value.filter(event => new Date(event.eventDate).getTime() < Date.now()).length

  return [
    {
      label: 'Eventos programados',
      detail: `${scheduledEvents} listos para seguimiento`,
      tone: 'warning' as const,
      icon: 'i-lucide-calendar-clock',
    },
    {
      label: 'Eventos en borrador',
      detail: draftEvents > 0 ? `${draftEvents} pendientes de publicación` : 'No hay borradores bloqueando la agenda',
      tone: draftEvents > 0 ? 'warning' as const : 'default' as const,
      icon: 'i-lucide-file-pen-line',
    },
    {
      label: 'Eventos cancelados',
      detail: cancelledEvents > 0 ? `${cancelledEvents} requieren seguimiento` : 'Sin cancelaciones activas',
      tone: cancelledEvents > 0 ? 'error' as const : 'success' as const,
      icon: 'i-lucide-ban',
    },
    {
      label: 'Histórico',
      detail: `${pastEvents} eventos ya celebrados`,
      tone: 'default' as const,
      icon: 'i-lucide-history',
    },
  ]
})

const quickActions = [
  {
    label: 'Crear evento',
    to: '/backoffice/events/new',
    kind: 'primary' as const,
    icon: 'i-lucide-calendar-plus',
  },
  {
    label: 'Ver catálogo',
    to: '/backoffice/events',
    kind: 'secondary' as const,
    icon: 'i-lucide-store',
  },
] as const

const dashboardChips = computed(() => {
  const scheduledEvents = events.value.filter(event => new Date(event.eventDate).getTime() >= Date.now()).length
  const drafts = events.value.filter(event => event.status === 'DRAFT').length

  return [
    { label: 'items activos', value: events.value.length },
    { label: 'en cola', value: drafts },
    { label: 'programados', value: scheduledEvents },
  ]
})

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
}

function getStatusTone(status: string) {
  if (status === 'PUBLISHED') {
    return 'success'
  }
  if (status === 'DRAFT') {
    return 'warning'
  }
  if (status === 'CANCELLED') {
    return 'error'
  }

  return 'neutral'
}

async function loadDashboard() {
  pending.value = true

  try {
    const eventsResponse = await listCatalog({
      pageValue: 1,
      pageSize: 12,
      filters: {
        search: '',
        city: '',
        genreId: '',
        formatId: '',
        dateFrom: '',
        dateTo: '',
      },
      quickWindow: 'all',
    })

    events.value = eventsResponse.data
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar el resumen del dashboard.', { id: 'admin-dashboard-load-error' })
  }
  finally {
    pending.value = false
  }
}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <BackofficePageShell
    title="Dashboard"
    description="Overview of events, artists, venues, and users. Designed for fast review and direct action."
    primary-action-to="/backoffice/events/new"
    primary-action-label="Nuevo evento"
  >
    <div class="mx-auto max-w-7xl space-y-8">
      <section class="grid gap-3 rounded-2xl border border-default/70 bg-elevated/45 p-4 md:grid-cols-[1.4fr_.8fr_.8fr_auto]">
        <FormInput placeholder="Search anything" icon="i-lucide-search" />
        <FormSelect label="Range" name="window" :items="[{ label: 'Range: 30 days', value: '30' }, { label: 'Range: 90 days', value: '90' }]" model-value="30" />
        <FormSelect label="Status" name="status" :items="[{ label: 'Status: all', value: 'all' }, { label: 'Status: active', value: 'active' }]" model-value="all" />
        <BaseButton kind="secondary">
          Apply
        </BaseButton>
      </section>

      <BackofficeToolbarChips :items="dashboardChips" />
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <template v-if="pending">
          <UiGlassPanel v-for="index in 4" :key="index" tone="subtle" radius="md" padding="md">
            <BaseSkeleton class="mb-4 size-10 rounded-lg" />
            <BaseSkeleton class="mb-2 h-8 w-16" />
            <BaseSkeleton class="h-4 w-24" />
          </UiGlassPanel>
        </template>

        <template v-else>
          <BackofficeStatCard
            v-for="metric in metrics"
            :key="metric.label"
            :label="metric.label"
            :value="metric.value"
            :hint="metric.hint"
            :icon="metric.icon"
            :tone="metric.variant"
          />
        </template>
      </div>

      <div class="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <BackofficeOverviewPanel eyebrow="Filter" title="Narrow data." description="Ajustá foco por ventana y estado operativo." tone="subtle">
          <div class="space-y-3 text-sm">
            <label class="flex items-center gap-2"><input checked type="checkbox"> Today</label>
            <label class="flex items-center gap-2"><input checked type="checkbox"> This week</label>
            <label class="flex items-center gap-2"><input type="checkbox"> This month</label>
          </div>
          <div class="mt-4 space-y-3 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox"> Draft</label>
            <label class="flex items-center gap-2"><input checked type="checkbox"> Published</label>
            <label class="flex items-center gap-2"><input type="checkbox"> Archived</label>
          </div>
        </BackofficeOverviewPanel>

        <div class="space-y-6">
          <BackofficeOverviewPanel eyebrow="Activity" title="Recent changes." description="Tickets, transfers, and moderation queue.">
            <template #actions>
              <BaseButton kind="tertiary" size="sm" to="/backoffice/events" trailing-icon="i-lucide-arrow-right">
                Ver todos
              </BaseButton>
            </template>

            <div v-if="pending" class="space-y-3">
              <BaseSkeleton v-for="index in 4" :key="index" class="h-24 rounded-xl" />
            </div>

            <UiEmptyState
              v-else-if="upcomingEvents.length === 0"
              icon="i-lucide-calendar-x"
              title="No hay próximos eventos"
              description="Crea un evento nuevo para empezar a poblar la agenda operativa del dashboard."
              action-label="Crear evento"
              action-to="/backoffice/events/new"
            />

            <div v-else class="overflow-hidden rounded-xl border border-default/65">
              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr class="border-b border-default/60 text-left text-xs tracking-wide text-muted uppercase">
                    <th class="px-4 py-3">
                      Item
                    </th>
                    <th class="px-4 py-3">
                      Type
                    </th>
                    <th class="px-4 py-3">
                      Status
                    </th>
                    <th class="px-4 py-3">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="event in upcomingEvents" :key="event.id" class="border-b border-default/50 last:border-0">
                    <td class="px-4 py-3 text-highlighted">
                      {{ event.name }}
                    </td>
                    <td class="px-4 py-3 text-toned">
                      Event
                    </td>
                    <td class="px-4 py-3">
                      <BaseBadge kind="status" :color="getStatusTone(event.status)" size="sm">
                        {{ event.status }}
                      </BaseBadge>
                    </td>
                    <td class="px-4 py-3 text-toned">
                      {{ formatDateTime(event.eventDate) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BackofficeOverviewPanel>

          <BackofficeOverviewPanel eyebrow="Queue" title="Needs attention." description="Tarjetas accionables para seguimiento rápido." tone="subtle">
            <div class="space-y-4">
              <div class="space-y-3">
                <div
                  v-for="item in attentionQueue"
                  :key="item.label"
                  class="flex items-start gap-3 rounded-xl border border-default/60 bg-default/25 px-4 py-3"
                >
                  <div
                    class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border"
                    :class="[
                      item.tone === 'warning' && 'border-warning/20 bg-warning/10 text-warning',
                      item.tone === 'success' && 'border-success/20 bg-success/10 text-success',
                      item.tone === 'error' && 'border-error/20 bg-error/10 text-error',
                      item.tone === 'default' && 'border-default bg-elevated text-muted',
                    ]"
                  >
                    <BaseIcon :name="item.icon" class="size-4" />
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm font-semibold text-highlighted">
                      {{ item.label }}
                    </p>
                    <p class="text-sm leading-relaxed text-toned">
                      {{ item.detail }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="border-t border-default/55 pt-4">
                <UiMetaLabel tone="accent">
                  Acciones rápidas
                </UiMetaLabel>
                <div class="mt-3 space-y-2.5">
                  <BaseButton
                    v-for="action in quickActions"
                    :key="action.to"
                    :to="action.to"
                    :kind="action.kind"
                    size="sm"
                    block
                    :leading-icon="action.icon"
                    class="justify-start"
                  >
                    {{ action.label }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </BackofficeOverviewPanel>
        </div>
      </div>
    </div>
  </BackofficePageShell>
</template>
