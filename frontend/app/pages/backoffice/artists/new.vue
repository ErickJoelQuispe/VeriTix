<script setup lang="ts">
import type {
  BackofficeArtistPayload,
  GenreOption,
} from '~~/shared/types'
import { useBackofficeArtistsRepository } from '@/repositories/backofficeArtistsRepository'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
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

  submitting.value = true

  try {
    await createBackofficeArtist(payload)

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
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Nuevo artista"
          description="Crea un artista y dejalo listo para asociar a eventos."
          action-label="Volver"
          action-to="/backoffice/artists"
        />
        <PagesBackofficeOverviewPanel
          title="Datos del artista"
          description="Completa la ficha principal para catalogo y búsqueda."
          variant="glass"
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
              <BaseSpinner class="h-12 w-full rounded-xl" />
              <BaseSpinner class="h-12 w-full rounded-xl" />
              <BaseSpinner class="h-24 w-full rounded-xl" />
              <BaseSpinner class="h-12 w-full rounded-xl" />
            </div>
          </template>

          <PagesBackofficeArtistForm
            v-else
            v-model:dirty="isFormDirty"
            :genres="genres"
            :submitting="submitting"
            submit-label="Crear artista"
            @submit="createArtist"
          />
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
