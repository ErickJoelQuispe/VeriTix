<script setup lang="ts">
import type {
  BackofficeArtistPayload,
  GenreOption,
} from '~/types'
import { useBackofficeArtistsRepository } from '~/repositories/backofficeArtistsRepository'
import { normalizeArtistPayload } from '~/utils/backoffice/formSafeRails'

definePageMeta({ middleware: 'backoffice' })
useSeoMeta({ title: 'Nuevo artista | Backoffice VeriTix' })

const { createArtist: createBackofficeArtist, listGenres } = useBackofficeArtistsRepository()
const { getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifySuccess } = useAppNotifications()

const genres = ref<GenreOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const isFormDirty = ref(false)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

async function loadGenres() {
  loading.value = true

  try {
    genres.value = await listGenres()
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar los géneros.', { id: 'admin-artists-load-genres-error' })
  }
  finally {
    loading.value = false
  }
}

async function createArtist(payload: BackofficeArtistPayload) {
  if (submitting.value) {
    return
  }

  const normalizedPayload = normalizeArtistPayload(payload)

  submitting.value = true

  try {
    await createBackofficeArtist(normalizedPayload)

    notifySuccess('Artista creado correctamente.', { id: 'admin-artists-create-success' })
    await navigateTo('/backoffice/artists')
  }
  catch (error) {
    if (getApiErrorStatus(error) === 409) {
      notifyError('Ya existe un artista con ese slug.', { id: 'admin-artists-create-conflict' })
      return
    }

    notifyApiError(error, 'No pudimos crear el artista.', { id: 'admin-artists-create-error' })
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadGenres()
})
</script>

<template>
  <BackofficePageShell
    title="Nuevo artista"
    description="Crea un artista y dejalo listo para asociar a eventos."
    primary-action-to="/backoffice/artists"
    primary-action-label="Volver a artistas"
  >
    <div class="mx-auto max-w-5xl space-y-5">
      <BackofficeOverviewPanel
        title="Datos del artista"
        description="Completa la ficha principal para catalogo y búsqueda."
        tone="subtle"
      >
        <template #actions>
          <div class="flex flex-wrap items-center gap-2.5">
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ genres?.length || 0 }} géneros
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

        <BackofficeArtistForm
          v-else
          v-model:dirty="isFormDirty"
          :genres="genres"
          :submitting="submitting"
          submit-label="Crear artista"
          @submit="createArtist"
        />
      </BackofficeOverviewPanel>
    </div>
  </BackofficePageShell>
</template>
