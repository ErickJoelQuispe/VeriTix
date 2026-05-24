<script setup lang="ts">
import type { BackofficeFormatRecord } from '~~/shared/types'
import { useBackofficeConcertFormatsRepository } from '@/repositories/backofficeConcertFormatsRepository'
import { PAGE_SIZE_OPTIONS } from '@/utils/backoffice/pagination'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Formatos | Backoffice VeriTix' })

const { deleteConcertFormat, listConcertFormats } = useBackofficeConcertFormatsRepository()
const { notifyApiError, notifyError, notifySuccess } = useAppNotifications()

const formats = ref<BackofficeFormatRecord[]>([])
const pending = ref(true)
const deletingId = ref('')

const page = ref(1)
const pageSize = ref(12)
const pageSizeOptions = PAGE_SIZE_OPTIONS

const filters = reactive({
  search: '',
})

const filtersOpen = ref(false)

const filteredFormats = computed(() => {
  const term = filters.search.trim().toLowerCase()

  if (!term) {
    return formats.value
  }

  return formats.value.filter((format) => {
    return [format.name, format.slug, format.description ?? '', format.icon ?? '']
      .join(' ')
      .toLowerCase()
      .includes(term)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredFormats.value.length / pageSize.value)))

const meta = computed(() => ({
  total: filteredFormats.value.length,
  page: page.value,
  limit: pageSize.value,
  totalPages: totalPages.value,
  hasNext: page.value < totalPages.value,
  hasPrev: page.value > 1,
}))

const paginatedFormats = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFormats.value.slice(start, end)
})

const toolbarChips = computed(() => {
  const withIcon = filteredFormats.value.filter(format => Boolean(format.icon)).length

  return [
    { label: 'visibles', value: meta.value.total, icon: 'i-lucide-ticket' },
    { label: 'con ícono', value: withIcon, icon: 'i-lucide-image' },
    { label: 'sin ícono', value: Math.max(filteredFormats.value.length - withIcon, 0), icon: 'i-lucide-ban' },
  ]
})

function goToPage(nextPage: number) {
  page.value = nextPage
}

async function loadFormats() {
  pending.value = true

  try {
    formats.value = await listConcertFormats()
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar los formatos.', { id: 'admin-formats-load-error' })
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

async function removeFormat(formatId: string) {
  deletingId.value = formatId

  try {
    await deleteConcertFormat(formatId)

    notifySuccess('Formato eliminado correctamente.', { id: `admin-formats-delete-${formatId}` })
    await loadFormats()
  }
  catch (error) {
    const statusCode = Number((error as { statusCode?: number })?.statusCode ?? 0)

    if (statusCode === 409) {
      notifyError('No pudimos eliminar el formato porque todavía se usa en otros registros.', { id: `admin-formats-delete-conflict-${formatId}` })
      return
    }

    notifyApiError(error, 'No pudimos eliminar el formato.', { id: `admin-formats-delete-error-${formatId}` })
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
  void loadFormats()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8" data-testid="backoffice-formats-page">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Formatos"
          description="Administrá los formatos de concierto usados en eventos y catálogos."
          action-label="Nuevo formato"
          action-to="/backoffice/concert-formats/new"
        />

        <PagesBackofficeOverviewPanel
          eyebrow="Filtros"
          title="Lista de formatos"
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
                search-label="Buscar formato"
                search-placeholder="Nombre, slug, descripción o ícono"
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
              v-else-if="paginatedFormats.length === 0"
              icon="i-lucide-ticket"
              title="Sin formatos"
              description="No encontramos formatos para estos filtros."
              action-label="Crear formato"
              action-to="/backoffice/concert-formats/new"
            />

            <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <UiPanel
                v-for="format in paginatedFormats"
                :key="format.id"
                variant="glass"
                radius="lg"
                padding="md"
                class="group relative h-full border-default/50 bg-linear-to-b from-elevated/25 to-elevated/10 shadow-sm transition hover:border-lavender/20 hover:shadow-md"
              >
                <div class="flex h-full flex-col gap-4">
                  <div class="flex items-start gap-4">
                    <div class="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-default/60 bg-default/40 text-2xl leading-none text-lavender">
                      <span aria-hidden="true">{{ format.icon || '🎫' }}</span>
                    </div>

                    <div class="min-w-0 flex-1 space-y-2">
                      <h3 class="truncate text-lg font-semibold text-highlighted">
                        {{ format.name }}
                      </h3>

                      <p v-if="format.description" class="line-clamp-2 text-sm leading-relaxed text-toned">
                        {{ format.description }}
                      </p>
                    </div>

                    <div class="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-default/40 bg-default/12 p-1 shadow-sm">
                      <BaseButton
                        variant="secondary"
                        size="sm"
                        class="size-10 p-0"
                        :to="`/backoffice/concert-formats/${format.id}/edit`"
                        :aria-label="`Editar ${format.name}`"
                      >
                        <BaseIcon name="i-lucide-pencil" class="size-5" aria-hidden="true" />
                      </BaseButton>

                      <PagesBackofficeDeleteAction
                        item-label="este formato"
                        :pending="deletingId === format.id"
                        :test-id="`admin-formats-delete-${format.id}`"
                        trigger-variant="danger"
                        trigger-class="size-10 p-0"
                        @confirm="removeFormat(format.id)"
                      >
                        <BaseIcon name="i-lucide-trash-2" class="size-5" aria-hidden="true" />
                        <span class="sr-only">Eliminar</span>
                      </PagesBackofficeDeleteAction>
                    </div>
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
