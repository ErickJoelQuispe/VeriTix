<script setup lang="ts">
import type { BackofficeGenreRecord } from '~~/shared/types'
import { useBackofficeGenresRepository } from '@/repositories/backofficeGenresRepository'
import { PAGE_SIZE_OPTIONS } from '@/utils/backoffice/pagination'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Géneros | Backoffice VeriTix' })

const { deleteGenre, listGenres } = useBackofficeGenresRepository()
const { notifyApiError, notifyError, notifySuccess } = useAppNotifications()

const genres = ref<BackofficeGenreRecord[]>([])
const pending = ref(true)
const deletingId = ref('')

const page = ref(1)
const pageSize = ref(12)
const pageSizeOptions = PAGE_SIZE_OPTIONS

const filters = reactive({
  search: '',
})

const filtersOpen = ref(false)

const filteredGenres = computed(() => {
  const term = filters.search.trim().toLowerCase()

  if (!term) {
    return genres.value
  }

  return genres.value.filter((genre) => {
    return [genre.name, genre.slug, genre.description ?? '']
      .join(' ')
      .toLowerCase()
      .includes(term)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredGenres.value.length / pageSize.value)))

const meta = computed(() => ({
  total: filteredGenres.value.length,
  page: page.value,
  limit: pageSize.value,
  totalPages: totalPages.value,
  hasNext: page.value < totalPages.value,
  hasPrev: page.value > 1,
}))

const paginatedGenres = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredGenres.value.slice(start, end)
})

const toolbarChips = computed(() => {
  const withDescription = filteredGenres.value.filter(genre => Boolean(genre.description)).length

  return [
    { label: 'visibles', value: meta.value.total, icon: 'i-lucide-music-2' },
    { label: 'con descripción', value: withDescription, icon: 'i-lucide-notebook-pen' },
    { label: 'sin descripción', value: Math.max(filteredGenres.value.length - withDescription, 0), icon: 'i-lucide-file-text' },
  ]
})

function goToPage(nextPage: number) {
  page.value = nextPage
}

async function loadGenres() {
  pending.value = true

  try {
    genres.value = await listGenres()
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar los géneros.', { id: 'admin-genres-load-error' })
  }
  finally {
    pending.value = false
  }
}

function applyFilters() {
  page.value = 1
}

function resetFilters() {
  filters.search = ''
  page.value = 1
}

async function removeGenre(genreId: string) {
  deletingId.value = genreId

  try {
    await deleteGenre(genreId)

    notifySuccess('Género eliminado correctamente.', { id: `admin-genres-delete-${genreId}` })
    await loadGenres()
  }
  catch (error) {
    const statusCode = Number((error as { statusCode?: number })?.statusCode ?? 0)

    if (statusCode === 409) {
      notifyError('No pudimos eliminar el género porque todavía se usa en otros registros.', { id: `admin-genres-delete-conflict-${genreId}` })
      return
    }

    notifyApiError(error, 'No pudimos eliminar el género.', { id: `admin-genres-delete-error-${genreId}` })
  }
  finally {
    deletingId.value = ''
  }
}

watch(() => [filters.search, pageSize.value], () => {
  page.value = 1
})

watch(totalPages, (nextTotalPages) => {
  if (page.value > nextTotalPages) {
    page.value = nextTotalPages
  }
})

onMounted(() => {
  void loadGenres()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8" data-testid="backoffice-genres-page">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Géneros"
          description="Administrá los géneros musicales usados en catálogos, artistas y eventos."
          action-label="Nuevo género"
          action-to="/backoffice/genres/new"
        />

        <PagesBackofficeOverviewPanel
          eyebrow="Filtros"
          title="Lista de géneros"
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
                :page-size-options="pageSizeOptions"
                :visible-filters="['pageSize']"
                search-label="Buscar género"
                search-placeholder="Nombre, slug o descripción"
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
              <BaseSpinner v-for="index in 6" :key="index" class="h-56 rounded-2xl" />
            </div>

            <UiEmptyState
              v-else-if="paginatedGenres.length === 0"
              icon="i-lucide-music-2"
              title="Sin géneros"
              description="No encontramos géneros para estos filtros."
              action-label="Crear género"
              action-to="/backoffice/genres/new"
            />

            <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <UiPanel
                v-for="genre in paginatedGenres"
                :key="genre.id"
                variant="glass"
                radius="lg"
                padding="md"
                class="group relative h-full border-default/50 bg-linear-to-b from-elevated/25 to-elevated/10 shadow-sm transition hover:border-lavender/20 hover:shadow-md"
              >
                <div class="flex h-full flex-col gap-4">
                  <div class="flex items-start gap-4">
                    <div class="min-w-0 flex-1 space-y-2">
                      <h3 class="truncate text-lg font-semibold text-highlighted">
                        {{ genre.name }}
                      </h3>

                      <p v-if="genre.description" class="line-clamp-2 text-sm leading-relaxed text-toned">
                        {{ genre.description }}
                      </p>
                    </div>

                    <div class="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-default/40 bg-default/12 p-1 shadow-sm">
                      <BaseButton
                        variant="secondary"
                        size="sm"
                        class="size-10 p-0"
                        :to="`/backoffice/genres/${genre.id}/edit`"
                        :aria-label="`Editar ${genre.name}`"
                      >
                        <BaseIcon name="i-lucide-pencil" class="size-5" aria-hidden="true" />
                      </BaseButton>

                      <PagesBackofficeDeleteAction
                        item-label="este género"
                        :pending="deletingId === genre.id"
                        :test-id="`admin-genres-delete-${genre.id}`"
                        trigger-variant="danger"
                        trigger-class="size-10 p-0"
                        @confirm="removeGenre(genre.id)"
                      >
                        <BaseIcon name="i-lucide-trash-2" class="size-5" aria-hidden="true" />
                        <span class="sr-only">Eliminar</span>
                      </PagesBackofficeDeleteAction>
                    </div>
                  </div>

                  <div class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
                    <BaseBadge kind="tag" color="primary" size="sm" class="rounded-full">
                      {{ genre.description ? 'Con descripción' : 'Sin descripción' }}
                    </BaseBadge>
                  </div>
                </div>
              </UiPanel>
            </div>
          </div>
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
