<script setup lang="ts">
import type {
  BackofficeArtistPayload,
  BackofficeArtistRecord,
  GenreOption,
} from '~~/shared/types'
import { useBackofficeArtistsRepository } from '@/repositories/backofficeArtistsRepository'
import { hasArtistSemanticChanges } from '@/utils/backoffice/formSafeRails'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Editar artista | Backoffice VeriTix' })

const route = useRoute()
const artistId = computed(() => String(route.params.id || ''))

const { getArtist: getBackofficeArtist, listGenres, updateArtist: updateBackofficeArtist } = useBackofficeArtistsRepository()
const { getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifyInfo, notifySuccess } = useAppNotifications()

const artist = ref<BackofficeArtistRecord | null>(null)
const genres = ref<GenreOption[]>([])
const loading = ref(true)
const submitting = ref(false)
const isFormDirty = ref(false)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

async function loadGenres() {
  try {
    genres.value = await listGenres()
  }
  catch {
    genres.value = []
  }
}

async function loadArtist() {
  loading.value = true

  try {
    artist.value = await getBackofficeArtist(artistId.value)
  }
  catch (error) {
    if (getApiErrorStatus(error) === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Artista no encontrado.',
      })
    }

    notifyApiError(error, 'No pudimos cargar el artista.', { id: 'admin-artists-load-error-edit' })
  }
  finally {
    loading.value = false
  }
}

async function updateArtist(payload: BackofficeArtistPayload) {
  if (submitting.value || !artist.value) {
    return
  }

  if (!hasArtistSemanticChanges(artist.value, payload)) {
    notifyInfo('No hay cambios para guardar.', { id: 'admin-artists-no-changes' })
    return
  }

  submitting.value = true

  try {
    artist.value = await updateBackofficeArtist(artistId.value, payload)

    notifySuccess('Artista actualizado correctamente.', { id: 'admin-artists-update-success' })
  }
  catch (error) {
    if (getApiErrorStatus(error) === 409) {
      notifyError('Ya existe un artista con ese slug.', { id: 'admin-artists-update-conflict' })
      return
    }

    notifyApiError(error, 'No pudimos actualizar el artista.', { id: 'admin-artists-update-error' })
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void Promise.all([loadGenres(), loadArtist()])
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <UiPageHeading eyebrow="Backoffice" title="Editar artista" description="Actualiza la ficha del artista y su información pública." />
          <BaseButton to="/backoffice/artists" variant="outlined" size="sm" leading-icon="i-lucide-arrow-left">
            Volver a artistas
          </BaseButton>
        </div>
        <PagesBackofficeOverviewPanel
          title="Datos del artista"
          description="Edita identidad, metadata y clasificación por género."
          variant="glass"
        >
          <template #actions>
            <div v-if="artist" class="flex flex-wrap items-center gap-2.5">
              <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
                {{ genres?.length || 0 }} géneros
              </BaseBadge>
              <BaseBadge kind="status" :color="artist.isActive ? 'success' : 'neutral'" size="sm" class="min-w-24 justify-center">
                {{ artist.isActive ? 'ACTIVO' : 'INACTIVO' }}
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
            v-else-if="artist"
            v-model:dirty="isFormDirty"
            :initial-value="artist"
            :genres="genres"
            :submitting="submitting"
            submit-label="Guardar cambios"
            @submit="updateArtist"
          />
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
