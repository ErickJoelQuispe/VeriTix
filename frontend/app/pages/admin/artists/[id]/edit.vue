<script setup lang="ts">
import type {
  AdminArtistPayload,
  AdminArtistRecord,
  GenreOption,
} from '~/types'
import { useAdminArtistsRepository } from '~/repositories/adminArtistsRepository'
import { hasArtistSemanticChanges, normalizeArtistPayload } from '~/utils/admin/formSafeRails'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Editar artista | Admin VeriTix' })

const route = useRoute()
const artistId = computed(() => String(route.params.id || ''))

const { getArtist: getAdminArtist, listGenres, updateArtist: updateAdminArtist } = useAdminArtistsRepository()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifyInfo, notifySuccess } = useAppNotifications()

const artist = ref<AdminArtistRecord | null>(null)
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
    artist.value = await getAdminArtist(artistId.value)
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

async function updateArtist(payload: AdminArtistPayload) {
  if (submitting.value || !artist.value) {
    return
  }

  const normalizedPayload = normalizeArtistPayload(payload)

  if (!hasArtistSemanticChanges(artist.value, normalizedPayload)) {
    notifyInfo('No hay cambios para guardar.', { id: 'admin-artists-no-changes' })
    return
  }

  submitting.value = true

  try {
    artist.value = await updateAdminArtist(artistId.value, normalizedPayload)

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
  <AdminPageShell
    title="Editar artista"
    description="Actualiza la ficha del artista y su información pública."
    primary-action-to="/admin/artists"
    primary-action-label="Volver a artistas"
  >
    <div class="mx-auto max-w-5xl space-y-5">
      <AdminOverviewPanel
        title="Datos del artista"
        description="Edita identidad, metadata y clasificación por género."
        tone="subtle"
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
            <USkeleton class="h-12 w-full rounded-xl" />
            <USkeleton class="h-12 w-full rounded-xl" />
            <USkeleton class="h-24 w-full rounded-xl" />
            <USkeleton class="h-12 w-full rounded-xl" />
          </div>
        </template>

        <AdminArtistForm
          v-else-if="artist"
          v-model:dirty="isFormDirty"
          :initial-value="artist"
          :genres="genres"
          :submitting="submitting"
          submit-label="Guardar cambios"
          @submit="updateArtist"
        />
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
