<script setup lang="ts">
import type { BackofficeConcertFormatPayload, BackofficeFormatRecord } from '~~/shared/types'
import { useBackofficeConcertFormatsRepository } from '@/repositories/backofficeConcertFormatsRepository'
import { hasConcertFormatSemanticChanges } from '@/utils/backoffice/formSafeRails'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Editar formato | Backoffice VeriTix' })

const route = useRoute()
const formatId = computed(() => String(route.params.id || ''))

const { getConcertFormat, updateConcertFormat } = useBackofficeConcertFormatsRepository()
const { getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifyInfo, notifySuccess } = useAppNotifications()

const format = ref<BackofficeFormatRecord | null>(null)
const loading = ref(true)
const submitting = ref(false)
const isFormDirty = ref(false)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

async function loadFormat() {
  loading.value = true

  try {
    format.value = await getConcertFormat(formatId.value)
  }
  catch (error) {
    if (getApiErrorStatus(error) === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formato no encontrado.',
      })
    }

    notifyApiError(error, 'No pudimos cargar el formato.', { id: 'admin-formats-load-error-edit' })
  }
  finally {
    loading.value = false
  }
}

async function handleUpdate(payload: BackofficeConcertFormatPayload) {
  if (submitting.value || !format.value) {
    return
  }

  if (!hasConcertFormatSemanticChanges(format.value, payload)) {
    notifyInfo('No hay cambios para guardar.', { id: 'admin-formats-no-changes' })
    return
  }

  submitting.value = true

  try {
    format.value = await updateConcertFormat(formatId.value, payload)

    notifySuccess('Formato actualizado correctamente.', { id: 'admin-formats-update-success' })
  }
  catch (error) {
    if (getApiErrorStatus(error) === 409) {
      notifyError('Ya existe un formato con ese slug o nombre.', { id: 'admin-formats-update-conflict' })
      return
    }

    notifyApiError(error, 'No pudimos actualizar el formato.', { id: 'admin-formats-update-error' })
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadFormat()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Editar formato"
          description="Actualizá la ficha del formato y su ícono opcional."
          action-label="Volver"
          action-to="/backoffice/concert-formats"
        />

        <PagesBackofficeOverviewPanel
          title="Datos del formato"
          description="Editá nombre, slug, descripción e ícono."
          variant="glass"
        >
          <template #actions>
            <div v-if="format" class="flex flex-wrap items-center gap-2.5">
              <BaseBadge kind="tag" color="primary" size="sm" class="min-w-24 justify-center">
                {{ format.slug }}
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

          <PagesBackofficeConcertFormatForm
            v-else-if="format"
            v-model:dirty="isFormDirty"
            :initial-value="format"
            :submitting="submitting"
            submit-label="Guardar cambios"
            @submit="handleUpdate"
          />
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
