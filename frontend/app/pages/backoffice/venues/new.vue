<script setup lang="ts">
import type { BackofficeVenuePayload } from '~~/shared/types'
import { useBackofficeVenuesRepository } from '@/repositories/backofficeVenuesRepository'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Nuevo recinto | Backoffice VeriTix' })

const { createVenue } = useBackofficeVenuesRepository()
const { getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifySuccess } = useAppNotifications()

const submitting = ref(false)
const isFormDirty = ref(false)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

async function handleCreate(payload: BackofficeVenuePayload) {
  if (submitting.value) {
    return
  }

  submitting.value = true

  try {
    await createVenue(payload)

    notifySuccess('Recinto creado correctamente.', { id: 'admin-venues-create-success' })
    await navigateTo('/backoffice/venues')
  }
  catch (error) {
    if (getApiErrorStatus(error) === 409) {
      notifyError('Ya existe un recinto con ese slug.', { id: 'admin-venues-create-conflict' })
      return
    }

    notifyApiError(error, 'No pudimos crear el recinto.', { id: 'admin-venues-create-error' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Nuevo recinto"
          description="Creá un recinto para asignar a eventos."
          action-label="Volver"
          action-to="/backoffice/venues"
        />
        <PagesBackofficeOverviewPanel
          title="Datos del recinto"
          description="Completá la ficha principal para catálogo y búsqueda."
          variant="glass"
        >
          <PagesBackofficeVenueForm
            v-model:dirty="isFormDirty"
            :submitting="submitting"
            submit-label="Crear recinto"
            @submit="handleCreate"
          />
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
