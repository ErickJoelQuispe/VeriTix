<script setup lang="ts">
import type {
  BackofficeArtistRecord,
  BackofficeOption,
  GenreOption,
  PaginatedMeta,
} from '~/types'
import { useBackofficeArtistsRepository } from '~/repositories/backofficeArtistsRepository'
import { PAGE_SIZE_OPTIONS } from '~/utils/backoffice/pagination'

definePageMeta({ middleware: 'backoffice' })
useSeoMeta({ title: 'Artistas | Backoffice VeriTix' })

const { deleteArtist: deleteBackofficeArtist, listArtists, listGenres } = useBackofficeArtistsRepository()
const { notifyApiError, notifySuccess } = useAppNotifications()

const artists = ref<BackofficeArtistRecord[]>([])
const genres = ref<GenreOption[]>([])
const pending = ref(true)
const deletingId = ref('')

const page = ref(1)
const pageSize = ref(12)
const pageSizeOptions = PAGE_SIZE_OPTIONS

const meta = ref<PaginatedMeta>({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
})

const statusOptions: BackofficeOption[] = [
  { id: 'true', name: 'Activo' },
  { id: 'false', name: 'Inactivo' },
]

const filters = reactive({
  search: '',
  genreId: '',
  isActive: '',
})

const genreFilterOptions = computed<BackofficeOption[]>(() => {
  return genres.value.map(genre => ({
    id: genre.id,
    name: genre.name,
  }))
})

const toolbarChips = computed(() => {
  const activeArtists = artists.value.filter(artist => artist.isActive).length
  const reviewArtists = Math.max(artists.value.length - activeArtists, 0)

  return [
    { label: 'visibles', value: meta.value.total },
    { label: 'activos', value: activeArtists },
    { label: 'revisión', value: reviewArtists },
  ]
})

function artistInitials(artist: BackofficeArtistRecord) {
  const initials = artist.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')

  return initials || 'A'
}

async function loadGenres() {
  try {
    genres.value = await listGenres()
  }
  catch {
    genres.value = []
  }
}

async function loadArtists(targetPage = page.value) {
  pending.value = true

  try {
    const response = await listArtists({
      pageValue: targetPage,
      pageSize: pageSize.value,
      search: filters.search,
      genreId: filters.genreId,
      isActive: filters.isActive,
    })

    artists.value = response.data
    meta.value = response.meta
    page.value = response.meta.page
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar los artistas.', { id: 'admin-artists-load-error' })
  }
  finally {
    pending.value = false
  }
}

function applyFilters() {
  page.value = 1
  void loadArtists(1)
}

function resetFilters() {
  filters.search = ''
  filters.genreId = ''
  filters.isActive = ''
  page.value = 1
  void loadArtists(1)
}

function goToPage(nextPage: number) {
  void loadArtists(nextPage)
}

async function removeArtist(artistId: string) {
  deletingId.value = artistId

  try {
    await deleteBackofficeArtist(artistId)

    notifySuccess('Artista eliminado correctamente.', { id: `admin-artists-delete-${artistId}` })
    await loadArtists(page.value)
  }
  catch (error) {
    notifyApiError(error, 'No pudimos eliminar el artista.', { id: `admin-artists-delete-error-${artistId}` })
  }
  finally {
    deletingId.value = ''
  }
}

onMounted(() => {
  void Promise.all([loadGenres(), loadArtists()])
})
</script>

<template>
  <BackofficePageShell
    title="Manage artists"
    description="Query by name, genre, status, and engagement."
    primary-action-to="/backoffice/artists/new"
    primary-action-label="Nuevo artista"
  >
    <div class="mx-auto max-w-7xl space-y-8" data-testid="backoffice-artists-page">
      <section class="grid gap-3 rounded-2xl border border-default/70 bg-elevated/45 p-4 md:grid-cols-[1.25fr_.72fr_.72fr_auto]">
        <FormInput v-model="filters.search" placeholder="Search artist or agent" icon="i-lucide-search" :disabled="pending" />
        <FormSelect label="Status" name="status" :model-value="filters.isActive || '__all__'" :items="[{ label: 'Status: all', value: '__all__' }, ...statusOptions.map(status => ({ label: status.name, value: status.id }))]" :disabled="pending" @update:model-value="filters.isActive = $event === '__all__' ? '' : String($event)" />
        <FormSelect label="Genre" name="genre" :model-value="filters.genreId || '__all__'" :items="[{ label: 'Genre: all', value: '__all__' }, ...genreFilterOptions.map(genre => ({ label: genre.name, value: genre.id }))]" :disabled="pending" @update:model-value="filters.genreId = $event === '__all__' ? '' : String($event)" />
        <BaseButton kind="secondary" :loading="pending" @click="applyFilters">
          Search
        </BaseButton>
      </section>

      <BackofficeOverviewPanel
        eyebrow="Filter"
        title="Narrow list."
        description="Query by name, genre, status, and engagement."
        tone="subtle"
      >
        <template #actions>
          <div class="flex items-center gap-3 sm:self-center">
            <BaseButton kind="tertiary" size="md" :disabled="pending" @click="resetFilters">
              Resetear
            </BaseButton>
            <BaseButton kind="primary" size="md" :loading="pending" @click="applyFilters">
              Aplicar
            </BaseButton>
          </div>
        </template>

        <div class="space-y-6">
          <BackofficeFiltersBar
            v-model:search="filters.search"
            v-model:page-size="pageSize"
            v-model:genre-id="filters.genreId"
            v-model:format-id="filters.isActive"
            :page-size-options="pageSizeOptions"
            :genres="genreFilterOptions"
            :formats="statusOptions"
            :visible-filters="['pageSize', 'genre', 'format']"
            search-label="Buscar artista"
            search-placeholder="Nombre del artista"
            genre-label="Género"
            genre-name="genreId"
            format-label="Estado"
            format-name="isActive"
            :loading="pending"
            class="w-full"
          />

          <BackofficeToolbarChips :items="toolbarChips" />

          <BackofficePaginationRail
            :page="meta.page"
            :total="meta.total"
            :items-per-page="meta.limit"
            :pending="pending"
            :show-edges="meta.totalPages > 5"
            @update:page="goToPage"
          />

          <div v-if="pending" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <BaseSkeleton v-for="index in 6" :key="index" class="h-80 rounded-2xl" />
          </div>

          <UiEmptyState
            v-else-if="artists.length === 0"
            icon="i-lucide-mic-2"
            title="Sin artistas"
            description="No encontramos artistas para estos filtros."
            action-label="Crear artista"
            action-to="/backoffice/artists/new"
          />

          <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <div
              v-for="artist in artists"
              :key="artist.id"
              class="group relative block"
            >
              <NuxtLink
                :to="`/backoffice/artists/${artist.id}/edit`"
                class="block"
              >
                <div class="aspect-square overflow-hidden rounded-xl bg-elevated/30">
                  <img
                    v-if="artist.imageUrl"
                    :src="artist.imageUrl"
                    :alt="artist.name"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  >
                  <div
                    v-else
                    class="flex h-full items-center justify-center bg-gradient-to-br from-toned/25 to-toned/10"
                  >
                    <BaseAvatar
                      :text="artistInitials(artist)"
                      size="xl"
                      class="!size-16"
                    />
                  </div>

                  <!-- Status -->
                  <div
                    class="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-80"
                    :class="artist.isActive ? 'bg-black/60 text-white' : 'bg-black/40 text-muted'"
                  >
                    {{ artist.isActive ? 'Activo' : 'Inactivo' }}
                  </div>
                </div>

                <div class="mt-2">
                  <h3 class="truncate text-sm font-medium text-highlighted">
                    {{ artist.name }}
                  </h3>
                  <p v-if="artist.genres.length" class="truncate text-xs text-toned">
                    {{ artist.genres.map(g => g.name).join(', ') }}
                  </p>
                </div>
              </NuxtLink>

              <!-- Delete action -->
              <BackofficeDeleteAction
                item-label="el artista"
                trigger-kind="tertiary"
                trigger-class="absolute right-1 top-1 opacity-0 group-hover:opacity-100 bg-black/60 hover:bg-error/80 text-white p-1.5 rounded transition-opacity"
                :pending="deletingId === artist.id"
                @confirm="removeArtist(artist.id)"
              />
            </div>
          </div>

          <BackofficePaginationRail
            :page="meta.page"
            :total="meta.total"
            :items-per-page="meta.limit"
            :pending="pending"
            :show-edges="meta.totalPages > 5"
            @update:page="goToPage"
          />
        </div>
      </BackofficeOverviewPanel>
    </div>
  </BackofficePageShell>
</template>
