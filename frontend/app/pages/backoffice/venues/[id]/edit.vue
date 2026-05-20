<script setup lang="ts">
import type { BackofficeVenuePayload, BackofficeVenueRecord } from '~~/shared/types'
import { useBackofficeVenuesRepository } from '@/repositories/backofficeVenuesRepository'
import { hasVenueSemanticChanges } from '@/utils/backoffice/formSafeRails'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Editar recinto | Backoffice VeriTix' })

const route = useRoute()
const venueId = computed(() => String(route.params.id || ''))

const { getVenue, updateVenue } = useBackofficeVenuesRepository()
const { getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifyInfo, notifySuccess } = useAppNotifications()

const venue = ref<BackofficeVenueRecord | null>(null)
const loading = ref(true)
const submitting = ref(false)
const isFormDirty = ref(false)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

async function loadVenue() {
  loading.value = true

  try {
    venue.value = await getVenue(venueId.value)
  }
  catch (error) {
    if (getApiErrorStatus(error) === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Recinto no encontrado.',
      })
    }

    notifyApiError(error, 'No pudimos cargar el recinto.', { id: 'admin-venues-load-error-edit' })
  }
  finally {
    loading.value = false
  }
}

async function handleUpdate(payload: BackofficeVenuePayload) {
  if (submitting.value || !venue.value) {
    return
  }

  if (!hasVenueSemanticChanges(venue.value, payload)) {
    notifyInfo('No hay cambios para guardar.', { id: 'admin-venues-no-changes' })
    return
  }

  submitting.value = true

  try {
    venue.value = await updateVenue(venueId.value, payload)

    notifySuccess('Recinto actualizado correctamente.', { id: 'admin-venues-update-success' })
  }
  catch (error) {
    if (getApiErrorStatus(error) === 409) {
      notifyError('Ya existe un recinto con ese slug.', { id: 'admin-venues-update-conflict' })
      return
    }

    notifyApiError(error, 'No pudimos actualizar el recinto.', { id: 'admin-venues-update-error' })
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadVenue()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Editar recinto"
          description="Actualizá los datos del recinto y su configuración."
          action-label="Volver"
          action-to="/backoffice/venues"
        />
        <PagesBackofficeOverviewPanel
          title="Datos del recinto"
          description="Editá identidad, ubicación y metadata del recinto."
          variant="glass"
        >
          <template #actions>
            <div v-if="venue" class="flex flex-wrap items-center gap-2.5">
              <BaseBadge kind="status" :color="venue.isActive ? 'success' : 'neutral'" size="sm" class="min-w-24 justify-center">
                {{ venue.isActive ? 'ACTIVO' : 'INACTIVO' }}
              </BaseBadge>
            </div>
          </template>

          <template v-if="loading">
            <div class="space-y-4">
              <BaseSkeleton class="h-12 w-full rounded-xl" />
              <BaseSkeleton class="h-12 w-full rounded-xl" />
              <BaseSkeleton class="h-12 w-full rounded-xl" />
              <BaseSkeleton class="h-12 w-full rounded-xl" />
              <BaseSkeleton class="h-12 w-full rounded-xl" />
            </div>
          </template>

          <PagesBackofficeVenueForm
            v-else-if="venue"
            v-model:dirty="isFormDirty"
            :initial-value="venue"
            :submitting="submitting"
            submit-label="Guardar cambios"
            @submit="handleUpdate"
          />
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
