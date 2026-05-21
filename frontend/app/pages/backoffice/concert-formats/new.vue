<script setup lang="ts">
import type { BackofficeConcertFormatPayload } from '~~/shared/types'
import { useBackofficeConcertFormatsRepository } from '@/repositories/backofficeConcertFormatsRepository'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Nuevo formato | Backoffice VeriTix' })

const { createConcertFormat } = useBackofficeConcertFormatsRepository()
const { getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifySuccess } = useAppNotifications()

const submitting = ref(false)
const isFormDirty = ref(false)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

async function handleCreate(payload: BackofficeConcertFormatPayload) {
  if (submitting.value) {
    return
  }

  submitting.value = true

  try {
    await createConcertFormat(payload)

    notifySuccess('Formato creado correctamente.', { id: 'admin-formats-create-success' })
    await navigateTo('/backoffice/concert-formats')
  }
  catch (error) {
    const statusCode = getApiErrorStatus(error)

    if (statusCode === 409) {
      notifyError('Ya existe un formato con ese slug o nombre.', { id: 'admin-formats-create-conflict' })
      return
    }

    notifyApiError(error, 'No pudimos crear el formato.', { id: 'admin-formats-create-error' })
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
          title="Nuevo formato"
          description="Creá un formato de concierto para clasificar y destacar eventos."
          action-label="Volver"
          action-to="/backoffice/concert-formats"
        />

        <PagesBackofficeOverviewPanel
          title="Datos del formato"
          description="Completá nombre, slug, descripción e ícono opcional."
          variant="glass"
        >
          <PagesBackofficeConcertFormatForm
            v-model:dirty="isFormDirty"
            :submitting="submitting"
            submit-label="Crear formato"
            @submit="handleCreate"
          />
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
