<script setup lang="ts">
import type { PaginationMeta } from '~~/shared/api/types'
import type {
  BackofficeArtistRecord,
  BackofficeOption,
  GenreOption,
} from '~~/shared/types'
import { useBackofficeArtistsRepository } from '@/repositories/backofficeArtistsRepository'
import { PAGE_SIZE_OPTIONS } from '@/utils/backoffice/pagination'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Artistas | Backoffice VeriTix' })

const { deleteArtist: deleteBackofficeArtist, listArtists, listGenres } = useBackofficeArtistsRepository()
const { notifyApiError, notifySuccess } = useAppNotifications()

const artists = ref<BackofficeArtistRecord[]>([])
const genres = ref<GenreOption[]>([])
const pending = ref(true)
const deletingId = ref('')
const deletingTarget = ref('')
const deleteModalOpen = ref(false)

const page = ref(1)
const pageSize = ref(12)
const pageSizeOptions = PAGE_SIZE_OPTIONS

const meta = ref<PaginationMeta>({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
})

const statusOptions: BackofficeOption[] = [
  { id: 'true', name: 'Activo' },
  { id: 'false', name: 'Inactivo' },
]

const filters = reactive({
  search: '',
  genreId: '',
  status: '',
})

const filtersOpen = ref(false)

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
    { label: 'visibles', value: meta.value.total, icon: 'i-lucide-chart-column' },
    { label: 'activos', value: activeArtists, icon: 'i-lucide-badge-check' },
    { label: 'revisión', value: reviewArtists, icon: 'i-lucide-circle-alert' },
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
      isActive: filters.status,
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
  filters.status = ''
  page.value = 1
  void loadArtists(1)
}

function goToPage(nextPage: number) {
  void loadArtists(nextPage)
}

function confirmDelete(artistId: string) {
  deletingTarget.value = artistId
  deleteModalOpen.value = true
}

function handleDeleteConfirm() {
  if (deletingTarget.value) {
    removeArtist(deletingTarget.value)
  }

  deleteModalOpen.value = false
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
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8" data-testid="backoffice-artists-page">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Artistas"
          description="Buscá artistas por nombre, género, estado y actividad."
          action-label="Nuevo artista"
          action-to="/backoffice/artists/new"
        />
        <PagesBackofficeOverviewPanel
          eyebrow="Filtros"
          title="Lista de artistas"
          variant="glass"
        >
          <template #actions>
            <div class="flex items-center gap-3 sm:self-center">
              <BaseButton
                variant="outlined"
                size="sm"
                class="lg:hidden"
                leading-icon="i-lucide-sliders-horizontal"
                @click="filtersOpen = !filtersOpen"
              >
                {{ filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros' }}
              </BaseButton>

              <div class="hidden gap-3 lg:flex">
                <BaseButton variant="primary" size="md" :loading="pending" @click="applyFilters">
                  Buscar
                </BaseButton>
                <BaseButton variant="reversed" size="md" :disabled="pending" @click="resetFilters">
                  Limpiar filtros
                </BaseButton>
              </div>
            </div>
          </template>

          <template #summary>
            <div class="flex flex-wrap items-center gap-2.5">
              <BaseBadge
                v-for="item in toolbarChips"
                :key="item.label"
                kind="tag"
                color="primary"
                size="sm"
                :icon="item.icon"
                class="min-w-28 justify-center rounded-full"
              >
                {{ item.label }}: {{ item.value }}
              </BaseBadge>
            </div>
          </template>

          <div class="space-y-6">
            <div class="space-y-6 lg:block" :class="[filtersOpen ? 'block' : 'hidden']">
              <PagesBackofficeFiltersBar
                v-model:search="filters.search"
                v-model:page-size="pageSize"
                v-model:genre-id="filters.genreId"
                v-model:status="filters.status"
                :page-size-options="pageSizeOptions"
                :genres="genreFilterOptions"
                :statuses="statusOptions"
                :visible-filters="['pageSize', 'genre', 'status']"
                search-label="Buscar artista"
                search-placeholder="Nombre del artista"
                genre-label="Género"
                genre-name="genreId"
                status-label="Estado"
                status-all-label="Todos los estados"
                status-name="status"
                :loading="pending"
                class="w-full"
              />

              <div class="flex flex-col gap-2 sm:flex-row sm:items-center lg:hidden">
                <BaseButton
                  variant="primary"
                  type="button"
                  size="sm"
                  class="w-full sm:w-auto order-first"
                  :loading="pending"
                  :leading-icon="pending ? undefined : 'i-lucide-search'"
                  @click="applyFilters"
                >
                  Buscar
                </BaseButton>

                <BaseButton
                  variant="reversed"
                  type="button"
                  size="sm"
                  class="w-full sm:w-auto"
                  :disabled="pending"
                  leading-icon="i-lucide-rotate-ccw"
                  @click="resetFilters"
                >
                  Limpiar filtros
                </BaseButton>
              </div>
            </div>

            <div class="flex justify-center pt-1 pb-1">
              <BasePagination
                :page="meta.page"
                :total="meta.total"
                :items-per-page="meta.limit"
                :disabled="pending"
                :sibling-count="1"
                size="sm"
                color="neutral"
                variant="ghost"
                active-color="primary"
                active-variant="soft"
                show-edges
                @update:page="goToPage"
              />
            </div>

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
                class="group relative flex flex-col"
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
                      class="flex h-full items-center justify-center bg-linear-to-br from-toned/25 to-toned/10"
                    >
                      <BaseAvatar
                        :text="artistInitials(artist)"
                        size="xl"
                        class="size-16!"
                      />
                    </div>

                    <!-- Status -->
                    <div
                      class="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-80"
                      :class="artist.isActive ? 'bg-black/60 text-white' : 'bg-black/40 text-muted'"
                    >
                      {{ artist.isActive ? 'Activo' : 'Inactivo' }}
                    </div>

                    <!-- Desktop delete — hover only -->
                    <button
                      type="button"
                      class="absolute right-1.5 top-1.5 flex size-7 items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 hover:bg-error/80 text-white rounded-md transition-opacity disabled:opacity-40 disabled:cursor-not-allowed max-lg:hidden"
                      :disabled="deletingId === artist.id"
                      :aria-label="`Eliminar ${artist.name}`"
                      @click.prevent="confirmDelete(artist.id)"
                    >
                      <BaseIcon name="i-lucide-trash-2" class="size-3.5" />
                    </button>
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

                <!-- Mobile buttons — always visible -->
                <div class="mt-auto grid grid-cols-2 gap-1.5 pt-2 lg:hidden">
                  <BaseButton
                    variant="primary"
                    size="xs"
                    class="w-full justify-center"
                    :to="`/backoffice/artists/${artist.id}/edit`"
                  >
                    <BaseIcon name="i-lucide-pencil" class="size-3" />
                  </BaseButton>
                  <BaseButton
                    variant="danger"
                    size="xs"
                    class="w-full justify-center"
                    :disabled="deletingId === artist.id"
                    @click="confirmDelete(artist.id)"
                  >
                    <BaseIcon name="i-lucide-trash-2" class="size-3" />
                  </BaseButton>
                </div>
              </div>
            </div>

            <div class="rounded-xl bg-elevated/20 px-3 py-2.5 sm:px-4 sm:py-3">
              <div class="flex w-full flex-wrap items-center justify-center">
                <BasePagination
                  :page="meta.page"
                  :total="meta.total"
                  :items-per-page="meta.limit"
                  :disabled="pending"
                  :sibling-count="1"
                  :show-edges="meta.totalPages > 5"
                  size="lg"
                  @update:page="goToPage"
                />
              </div>
            </div>
          </div>
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>

    <UiConfirmModal
      :open="deleteModalOpen"
      title="Eliminar artista"
      description="¿Estás seguro de que querés eliminar este artista? Esta acción no se puede deshacer."
      confirm-label="Eliminar"
      cancel-label="Cancelar"
      :pending="deletingId === deletingTarget"
      @confirm="handleDeleteConfirm"
      @cancel="deleteModalOpen = false; deletingTarget = ''"
    />
  </section>
</template>
