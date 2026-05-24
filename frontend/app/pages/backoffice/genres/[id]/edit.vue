<script setup lang="ts">
import type { BackofficeGenrePayload, BackofficeGenreRecord } from '~~/shared/types'
import { useBackofficeGenresRepository } from '@/repositories/backofficeGenresRepository'
import { hasGenreSemanticChanges } from '@/utils/backoffice/formSafeRails'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Editar género | Backoffice VeriTix' })

const route = useRoute()
const genreId = computed(() => String(route.params.id || ''))

const { getGenre, updateGenre } = useBackofficeGenresRepository()
const { getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifyInfo, notifySuccess } = useAppNotifications()

const genre = ref<BackofficeGenreRecord | null>(null)
const loading = ref(true)
const submitting = ref(false)
const isFormDirty = ref(false)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

async function loadGenre() {
  loading.value = true

  try {
    genre.value = await getGenre(genreId.value)
  }
  catch (error) {
    if (getApiErrorStatus(error) === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Género no encontrado.',
      })
    }

    notifyApiError(error, 'No pudimos cargar el género.', { id: 'admin-genres-load-error-edit' })
  }
  finally {
    loading.value = false
  }
}

async function handleUpdate(payload: BackofficeGenrePayload) {
  if (submitting.value || !genre.value) {
    return
  }

  if (!hasGenreSemanticChanges(genre.value, payload)) {
    notifyInfo('No hay cambios para guardar.', { id: 'admin-genres-no-changes' })
    return
  }

  submitting.value = true

  try {
    genre.value = await updateGenre(genreId.value, payload)

    notifySuccess('Género actualizado correctamente.', { id: 'admin-genres-update-success' })
  }
  catch (error) {
    if (getApiErrorStatus(error) === 409) {
      notifyError('Ya existe un género con ese slug o nombre.', { id: 'admin-genres-update-conflict' })
      return
    }

    notifyApiError(error, 'No pudimos actualizar el género.', { id: 'admin-genres-update-error' })
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadGenre()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Editar género"
          description="Actualizá la ficha del género musical y su clasificación pública."
          action-label="Volver"
          action-to="/backoffice/genres"
        />

        <PagesBackofficeOverviewPanel
          title="Datos del género"
          description="Editá nombre, slug y descripción opcional."
          variant="glass"
        >
          <template #actions>
            <div v-if="genre" class="flex flex-wrap items-center gap-2.5">
              <BaseBadge kind="tag" color="primary" size="sm" class="min-w-24 justify-center">
                {{ genre.slug }}
              </BaseBadge>
            </div>
          </template>

          <template v-if="loading">
            <div class="space-y-4">
              <BaseSpinner class="h-12 w-full rounded-xl" />
              <BaseSpinner class="h-12 w-full rounded-xl" />
              <BaseSpinner class="h-24 w-full rounded-xl" />
            </div>
          </template>

          <PagesBackofficeGenreForm
            v-else-if="genre"
            v-model:dirty="isFormDirty"
            :initial-value="genre"
            :submitting="submitting"
            submit-label="Guardar cambios"
            @submit="handleUpdate"
          />
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
