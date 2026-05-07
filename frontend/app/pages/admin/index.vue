<script setup lang="ts">
import type {
  AdminEventRecord,
} from '~/types'
import { useAdminEventsRepository } from '~/repositories/adminEventsRepository'

definePageMeta({
  middleware: 'admin',
})

useSeoMeta({
  title: 'Admin | VeriTix',
  description: 'Dashboard operativo de eventos en VeriTix.',
})

const { listCatalog } = useAdminEventsRepository()
const { notifyApiError } = useAppNotifications()

const events = ref<AdminEventRecord[]>([])
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
    to: '/admin/events/new',
    kind: 'primary' as const,
    icon: 'i-lucide-calendar-plus',
  },
  {
    label: 'Ver catálogo',
    to: '/admin/events',
    kind: 'secondary' as const,
    icon: 'i-lucide-store',
  },
] as const

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
  <AdminPageShell
    title="Dashboard"
    description="Supervisa agenda y estado operativo de eventos desde una vista clara y enfocada."
    primary-action-to="/admin/events/new"
    primary-action-label="Nuevo evento"
  >
    <div class="mx-auto max-w-7xl space-y-8">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <template v-if="pending">
          <UiGlassPanel v-for="index in 4" :key="index" tone="subtle" radius="md" padding="md">
            <USkeleton class="mb-4 size-10 rounded-lg" />
            <USkeleton class="mb-2 h-8 w-16" />
            <USkeleton class="h-4 w-24" />
          </UiGlassPanel>
        </template>

        <template v-else>
          <AdminStatCard
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

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)]">
        <AdminOverviewPanel
          eyebrow="Agenda"
          title="Próximos eventos"
          description="Lo siguiente que entra en operación. Prioriza aquí la revisión diaria y los eventos que van a salir primero."
        >
          <template #actions>
            <BaseButton kind="tertiary" size="sm" to="/admin/events" trailing-icon="i-lucide-arrow-right">
              Ver todos
            </BaseButton>
          </template>

          <div v-if="pending" class="space-y-3">
            <USkeleton v-for="index in 4" :key="index" class="h-24 rounded-xl" />
          </div>

          <AdminEmptyState
            v-else-if="upcomingEvents.length === 0"
            icon="i-lucide-calendar-x"
            title="No hay próximos eventos"
            description="Crea un evento nuevo para empezar a poblar la agenda operativa del dashboard."
            action-label="Crear evento"
            action-to="/admin/events/new"
          />

          <div v-else class="divide-y divide-default/55">
            <NuxtLink
              v-for="event in upcomingEvents"
              :key="event.id"
              :to="`/admin/events/${event.id}/edit`"
              class="group flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex min-w-0 items-start gap-4">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-warning/20 bg-warning/10 text-warning">
                  <UIcon name="i-lucide-calendar-range" class="size-5" />
                </div>

                <div class="min-w-0 space-y-2">
                  <p class="truncate text-base font-semibold text-highlighted transition-colors group-hover:text-warning">
                    {{ event.name }}
                  </p>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-toned">
                    <span class="inline-flex min-w-0 items-center gap-2">
                      <UIcon name="i-lucide-map-pin" class="size-3.5 text-muted" />
                      <span class="truncate">{{ event.venue.name }} · {{ event.venue.city }}</span>
                    </span>

                    <span class="inline-flex items-center gap-2">
                      <UIcon name="i-lucide-clock-3" class="size-3.5 text-muted" />
                      {{ formatDateTime(event.eventDate) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-3 self-start sm:self-center">
                <BaseBadge kind="status" :color="getStatusTone(event.status)" size="sm">
                  {{ event.status }}
                </BaseBadge>

                <UIcon name="i-lucide-chevron-right" class="size-4 text-muted transition-colors group-hover:text-highlighted" />
              </div>
            </NuxtLink>
          </div>
        </AdminOverviewPanel>

        <AdminOverviewPanel
          eyebrow="Operación"
          title="Foco del día"
          description="Un resumen corto de lo que merece atención y de las acciones más probables dentro del flujo admin."
          tone="subtle"
        >
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
                  <UIcon :name="item.icon" class="size-4" />
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
        </AdminOverviewPanel>
      </div>
    </div>
  </AdminPageShell>
</template>
