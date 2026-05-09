<script setup lang="ts">
import type {
  BackofficeEventPayload,
  BackofficeOption,
  GenreOption,
  VenueOption,
} from '~~/shared/types'
import { useBackofficeEventsRepository } from '@/repositories/backofficeEventsRepository'
import { normalizeEventPayload } from '@/utils/backoffice/formSafeRails'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Nuevo evento | Backoffice VeriTix' })

const { createEvent: createBackofficeEvent, getFormOptions } = useBackofficeEventsRepository()
const { notifyApiError, notifySuccess } = useAppNotifications()

const venues = ref<VenueOption[]>([])
const genres = ref<GenreOption[]>([])
const formats = ref<BackofficeOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const isFormDirty = ref(false)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

async function loadOptions() {
  loading.value = true

  try {
    const options = await getFormOptions()

    venues.value = options.venues ?? []
    genres.value = options.genres ?? []
    formats.value = options.formats ?? []
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar las opciones del evento.', { id: 'admin-events-load-options-error' })
  }
  finally {
    loading.value = false
  }
}

async function createEvent(payload: BackofficeEventPayload) {
  if (submitting.value) {
    return
  }

  const normalizedPayload = normalizeEventPayload(payload)

  submitting.value = true

  try {
    await createBackofficeEvent(normalizedPayload)

    notifySuccess('Evento creado correctamente.', { id: 'admin-events-create-success' })
    await navigateTo('/backoffice/events')
  }
  catch (error) {
    notifyApiError(error, 'No pudimos crear el evento.', { id: 'admin-events-create-error' })
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadOptions()
})
</script>

<template>
  <BackofficePageShell
    title="Nuevo evento"
    description="Crea un evento y dejalo listo para publicar."
    primary-action-to="/backoffice/events"
    primary-action-label="Volver a eventos"
  >
    <div class="mx-auto max-w-5xl space-y-5">
      <BackofficeOverviewPanel
        title="Datos del evento"
        description="Completa los campos principales para crear la ficha."
        variant="glass"
      >
        <template #actions>
          <div class="flex flex-wrap items-center gap-2.5">
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ venues?.length || 0 }} venues
            </BaseBadge>
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ formats?.length || 0 }} formatos
            </BaseBadge>
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ genres?.length || 0 }} generos
            </BaseBadge>
          </div>
        </template>

        <template v-if="loading">
          <div class="space-y-4">
            <BaseSkeleton class="h-12 w-full rounded-xl" />
            <BaseSkeleton class="h-12 w-full rounded-xl" />
            <BaseSkeleton class="h-24 w-full rounded-xl" />
            <BaseSkeleton class="h-12 w-full rounded-xl" />
          </div>
        </template>

        <BackofficeEventForm
          v-else
          v-model:dirty="isFormDirty"
          :venues="venues"
          :genres="genres"
          :formats="formats"
          :submitting="submitting"
          submit-label="Crear evento"
          @submit="createEvent"
        />
      </BackofficeOverviewPanel>
    </div>
  </BackofficePageShell>
</template>
