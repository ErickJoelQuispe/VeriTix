<script setup lang="ts">
import type {
  AdminEventDetail,
  AdminEventPayload,
  AdminOption,
  GenreOption,
  VenueOption,
} from '~/types'
import { useAdminEventsRepository } from '~/repositories/adminEventsRepository'
import { hasEventSemanticChanges, normalizeEventPayload } from '~/utils/admin/formSafeRails'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Editar evento | Admin VeriTix' })

const route = useRoute()
const eventId = computed(() => String(route.params.id || ''))

const { getFormOptions, getEvent: getAdminEvent, updateEvent: updateAdminEvent } = useAdminEventsRepository()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyInfo, notifySuccess } = useAppNotifications()

const event = ref<AdminEventDetail | null>(null)
const venues = ref<VenueOption[]>([])
const genres = ref<GenreOption[]>([])
const formats = ref<AdminOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const isFormDirty = ref(false)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

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

async function loadOptions() {
  const options = await getFormOptions()

  venues.value = options.venues
  genres.value = options.genres
  formats.value = options.formats
}

async function loadEvent() {
  loading.value = true

  try {
    event.value = await getAdminEvent(eventId.value)
  }
  catch (error) {
    if (getApiErrorStatus(error) === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Evento no encontrado.',
      })
    }

    notifyApiError(error, 'No pudimos cargar el evento.', { id: 'admin-events-load-error-edit' })
  }
  finally {
    loading.value = false
  }
}

async function updateEvent(payload: AdminEventPayload) {
  if (submitting.value || !event.value) {
    return
  }

  const normalizedPayload = normalizeEventPayload(payload)

  if (!hasEventSemanticChanges(event.value, normalizedPayload)) {
    notifyInfo('No hay cambios para guardar.', { id: 'admin-events-no-changes' })
    return
  }

  submitting.value = true

  try {
    event.value = await updateAdminEvent(eventId.value, normalizedPayload)

    notifySuccess('Evento actualizado correctamente.', { id: 'admin-events-update-success' })
  }
  catch (error) {
    notifyApiError(error, 'No pudimos actualizar el evento.', { id: 'admin-events-update-error' })
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void Promise.all([loadOptions(), loadEvent()])
})
</script>

<template>
  <AdminPageShell
    title="Editar evento"
    description="Actualiza la ficha del evento y su configuración operativa."
    primary-action-to="/admin/events"
    primary-action-label="Volver a eventos"
  >
    <div class="mx-auto max-w-5xl space-y-5">
      <AdminOverviewPanel
        title="Datos del evento"
        description="Edita los campos principales del evento seleccionado."
        tone="subtle"
      >
        <template #actions>
          <div v-if="event" class="flex flex-wrap items-center gap-2.5">
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ venues?.length || 0 }} venues
            </BaseBadge>
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ formats?.length || 0 }} formatos
            </BaseBadge>
            <BaseBadge kind="status" :color="getStatusTone(event.status)" size="sm" class="min-w-24 justify-center">
              {{ event.status }}
            </BaseBadge>
          </div>
        </template>

        <template v-if="loading">
          <div class="space-y-4">
            <USkeleton class="h-12 w-full rounded-xl" />
            <USkeleton class="h-12 w-full rounded-xl" />
            <USkeleton class="h-24 w-full rounded-xl" />
            <USkeleton class="h-12 w-full rounded-xl" />
          </div>
        </template>

        <AdminEventForm
          v-else-if="event"
          v-model:dirty="isFormDirty"
          :initial-value="event"
          :venues="venues"
          :genres="genres"
          :formats="formats"
          :submitting="submitting"
          submit-label="Guardar cambios"
          @submit="updateEvent"
        />
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
