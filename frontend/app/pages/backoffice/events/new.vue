<script setup lang="ts">
import type {
  BackofficeEventPayload,
  BackofficeOption,
  EventArtistEntry,
  GenreOption,
  VenueOption,
} from '~~/shared/types'
import { useBackofficeEventsRepository } from '@/repositories/backofficeEventsRepository'
import { useEventArtistsRepository } from '@/repositories/eventArtistsRepository'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Nuevo evento | Backoffice VeriTix' })

const { createEvent: createBackofficeEvent, getFormOptions } = useBackofficeEventsRepository()
const { addToEvent } = useEventArtistsRepository()
const { notifyApiError, notifySuccess } = useAppNotifications()

const formRef = ref<{ pendingArtists: EventArtistEntry[] } | null>(null)
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

  submitting.value = true

  try {
    const created = await createBackofficeEvent(payload)

    const pendingArtists = formRef.value?.pendingArtists ?? []

    if (pendingArtists.length > 0 && created.id) {
      await Promise.all(
        pendingArtists.map((entry, index) =>
          addToEvent(created.id, {
            artistId: entry.artist.id,
            role: entry.role,
            performanceOrder: index + 1,
          }),
        ),
      )
    }

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
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Nuevo evento"
          description="Crea un evento y dejalo listo para publicar."
          action-label="Volver"
          action-to="/backoffice/events"
        />
        <PagesBackofficeOverviewPanel
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

          <PagesBackofficeEventForm
            v-else
            ref="formRef"
            v-model:dirty="isFormDirty"
            :venues="venues"
            :genres="genres"
            :formats="formats"
            :submitting="submitting"
            submit-label="Crear evento"
            @submit="createEvent"
          />
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
