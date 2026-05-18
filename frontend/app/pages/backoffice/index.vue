<script setup lang="ts">
import type { BackofficeEventRecord } from '~~/shared/types'
import { useBackofficeEventsRepository } from '@/repositories/backofficeEventsRepository'

definePageMeta({
  layout: 'backoffice',
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
      icon: 'i-lucide-circle-alert',
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
    variant: 'primary' as const,
    icon: 'i-lucide-calendar-plus',
  },
  {
    label: 'Ver catálogo',
    to: '/backoffice/events',
    variant: 'secondary' as const,
    icon: 'i-lucide-store',
  },
] as const

function attentionToneClass(tone: string) {
  if (tone === 'warning') {
    return 'border-warning/20 bg-warning/10 text-warning'
  }
  if (tone === 'success') {
    return 'border-success/20 bg-success/10 text-success'
  }
  if (tone === 'error') {
    return 'border-error/20 bg-error/10 text-error'
  }

  return 'border-default bg-elevated text-muted'
}

function statCardIconBoxClass(tone: string) {
  const base = 'flex size-10 items-center justify-center rounded-lg border'

  if (tone === 'warning') {
    return `${base} border-warning/20 bg-warning/10 text-warning`
  }
  if (tone === 'success') {
    return `${base} border-success/20 bg-success/10 text-success`
  }
  if (tone === 'primary') {
    return `${base} border-primary/20 bg-primary/10 text-primary`
  }
  if (tone === 'error') {
    return `${base} border-error/20 bg-error/10 text-error`
  }

  return `${base} border-default bg-default/60 text-muted`
}

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

function getStatusLabel(status: string) {
  if (status === 'PUBLISHED') {
    return 'Publicado'
  }
  if (status === 'DRAFT') {
    return 'Borrador'
  }
  if (status === 'CANCELLED') {
    return 'Cancelado'
  }

  return status
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
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <UiPageHeading
            eyebrow="Backoffice"
            title="Dashboard"
            description="Resumen operativo del backoffice con métricas, actividad reciente y seguimiento rápido."
          />
        </div>
        <!-- Metrics -->
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <template v-if="pending">
            <UiPanel v-for="i in 3" :key="i" variant="glass" radius="md" padding="md">
              <BaseSkeleton class="mb-4 size-10 rounded-lg" />
              <BaseSkeleton class="mb-2 h-8 w-16" />
              <BaseSkeleton class="h-4 w-24" />
            </UiPanel>
          </template>

          <UiPanel
            v-for="metric in metrics"
            v-else
            :key="metric.label"
            variant="glass"
            radius="md"
            padding="md"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-3">
                <UiMetaLabel>
                  {{ metric.label }}
                </UiMetaLabel>

                <div class="space-y-1">
                  <p class="text-3xl font-semibold tracking-tight text-highlighted">
                    {{ metric.value }}
                  </p>
                  <p v-if="metric.hint" class="text-sm text-toned">
                    {{ metric.hint }}
                  </p>
                </div>
              </div>

              <div :class="statCardIconBoxClass(metric.variant)">
                <BaseIcon :name="metric.icon" class="size-5" />
              </div>
            </div>
          </UiPanel>
        </div>

        <!-- Activity + Attention -->
        <div class="grid gap-6 xl:grid-cols-2">
          <!-- Actividad reciente -->
          <PagesBackofficeOverviewPanel title="Actividad reciente" description="Próximos eventos en la agenda." variant="glass">
            <template #actions>
              <BaseButton variant="outlined" size="sm" to="/backoffice/events" trailing-icon="i-lucide-arrow-right">
                Ver todos
              </BaseButton>
            </template>

            <div v-if="pending" class="space-y-3">
              <BaseSkeleton v-for="i in 4" :key="i" class="h-20 rounded-xl" />
            </div>

            <UiEmptyState
              v-else-if="upcomingEvents.length === 0"
              icon="i-lucide-calendar-x"
              title="No hay próximos eventos"
              description="Creá un evento nuevo para empezar a poblar la agenda operativa del dashboard."
              action-label="Crear evento"
              action-to="/backoffice/events/new"
            />

            <div v-else class="overflow-hidden rounded-xl border border-default/65">
              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr class="border-b border-default/60 text-left text-xs tracking-wide text-muted uppercase">
                    <th class="px-4 py-3">
                      Evento
                    </th>
                    <th class="px-4 py-3">
                      Fecha
                    </th>
                    <th class="px-4 py-3">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="event in upcomingEvents" :key="event.id" class="border-b border-default/50 last:border-0">
                    <td class="px-4 py-3">
                      <NuxtLink
                        :to="`/backoffice/events/${event.id}/edit`"
                        class="text-highlighted transition-colors duration-150 hover:text-primary"
                      >
                        {{ event.name }}
                      </NuxtLink>
                    </td>
                    <td class="px-4 py-3 text-toned">
                      {{ formatDateTime(event.eventDate) }}
                    </td>
                    <td class="px-4 py-3">
                      <BaseBadge kind="status" :color="getStatusTone(event.status)" size="sm">
                        {{ getStatusLabel(event.status) }}
                      </BaseBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </PagesBackofficeOverviewPanel>

          <!-- Requiere atención -->
          <PagesBackofficeOverviewPanel title="Requiere atención" description="Seguimiento rápido del estado operativo." variant="glass">
            <div class="space-y-4">
              <div class="space-y-3">
                <div
                  v-for="item in attentionQueue"
                  :key="item.label"
                  class="flex items-start gap-3 rounded-xl border border-default/60 bg-default/25 px-4 py-3"
                >
                  <div
                    class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border"
                    :class="attentionToneClass(item.tone)"
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
                    :variant="action.variant"
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
          </PagesBackofficeOverviewPanel>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
