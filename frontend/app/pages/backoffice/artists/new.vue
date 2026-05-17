<script setup lang="ts">
import type {
  BackofficeArtistPayload,
  GenreOption,
} from '~~/shared/types'
import { useBackofficeArtistsRepository } from '@/repositories/backofficeArtistsRepository'
import { normalizeArtistPayload } from '@/utils/backoffice/formSafeRails'

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
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <UiPageHeading eyebrow="Backoffice" title="Nuevo artista" description="Crea un artista y dejalo listo para asociar a eventos." />
          <BaseButton to="/backoffice/artists" variant="outlined" size="sm" leading-icon="i-lucide-arrow-left">
            Volver a artistas
          </BaseButton>
        </div>
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
              <BaseSkeleton class="h-12 w-full rounded-xl" />
              <BaseSkeleton class="h-12 w-full rounded-xl" />
              <BaseSkeleton class="h-24 w-full rounded-xl" />
              <BaseSkeleton class="h-12 w-full rounded-xl" />
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
