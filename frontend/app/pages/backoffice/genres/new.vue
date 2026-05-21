<script setup lang="ts">
import type { BackofficeGenrePayload } from '~~/shared/types'
import { useBackofficeGenresRepository } from '@/repositories/backofficeGenresRepository'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Nuevo género | Backoffice VeriTix' })

const { createGenre } = useBackofficeGenresRepository()
const { getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifySuccess } = useAppNotifications()

const submitting = ref(false)
const isFormDirty = ref(false)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

async function handleCreate(payload: BackofficeGenrePayload) {
  if (submitting.value) {
    return
  }

  submitting.value = true

  try {
    await createGenre(payload)

    notifySuccess('Género creado correctamente.', { id: 'admin-genres-create-success' })
    await navigateTo('/backoffice/genres')
  }
  catch (error) {
    const statusCode = getApiErrorStatus(error)

    if (statusCode === 409) {
      notifyError('Ya existe un género con ese slug o nombre.', { id: 'admin-genres-create-conflict' })
      return
    }

    notifyApiError(error, 'No pudimos crear el género.', { id: 'admin-genres-create-error' })
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
          title="Nuevo género"
          description="Creá un género musical para el catálogo y la clasificación de artistas."
          action-label="Volver"
          action-to="/backoffice/genres"
        />

        <PagesBackofficeOverviewPanel
          title="Datos del género"
          description="Completá nombre, slug y descripción opcional."
          variant="glass"
        >
          <PagesBackofficeGenreForm
            v-model:dirty="isFormDirty"
            :submitting="submitting"
            submit-label="Crear género"
            @submit="handleCreate"
          />
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
