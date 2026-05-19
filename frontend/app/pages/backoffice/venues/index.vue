<script setup lang="ts">
import type { PaginationMeta } from '~~/shared/api/types'
import type { BackofficeOption, BackofficeVenueRecord } from '~~/shared/types'
import { useBackofficeVenuesRepository } from '@/repositories/backofficeVenuesRepository'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Venues | Backoffice VeriTix' })

const { listVenues } = useBackofficeVenuesRepository()
const { notifyApiError } = useAppNotifications()

const venues = ref<BackofficeVenueRecord[]>([])
const pending = ref(true)
const integrationStatus = ref<'connected' | 'pending'>('connected')

const page = ref(1)
const pageSize = ref(12)

const meta = ref<PaginationMeta>({ total: 0, page: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false })

const statusOptions: BackofficeOption[] = [
  { id: 'true', name: 'Activo' },
  { id: 'false', name: 'Inactivo' },
]

const filters = reactive({
  search: '',
  city: '',
  status: '',
})

const filtersOpen = ref(false)

const toolbarChips = computed(() => {
  const activeCount = venues.value.filter(venue => venue.isActive).length
  return [
    { label: 'visibles', value: meta.value.total, icon: 'i-lucide-chart-column' },
    { label: 'activos', value: activeCount, icon: 'i-lucide-badge-check' },
    { label: 'integración', value: integrationStatus.value === 'connected' ? 'lista' : 'pendiente', icon: integrationStatus.value === 'connected' ? 'i-lucide-plug-zap' : 'i-lucide-circle-alert' },
  ]
})

async function loadVenues(targetPage = page.value) {
  pending.value = true

  try {
    const response = await listVenues({
      pageValue: targetPage,
      pageSize: pageSize.value,
      search: filters.search,
      city: filters.city,
      isActive: filters.status,
    })

    venues.value = response.data
    meta.value = response.meta
    page.value = response.meta.page
    integrationStatus.value = 'connected'
  }
  catch (error) {
    const statusCode = Number((error as { statusCode?: number })?.statusCode ?? 0)

    if (statusCode === 404 || statusCode === 501) {
      integrationStatus.value = 'pending'
      venues.value = []
      meta.value = { total: 0, page: 1, limit: pageSize.value, totalPages: 1, hasNext: false, hasPrev: false }
      page.value = 1
      return
    }

    notifyApiError(error, 'No pudimos cargar los venues.', { id: 'admin-venues-load-error' })
  }
  finally {
    pending.value = false
  }
}

function applyFilters() {
  page.value = 1
  void loadVenues(1)
}

function resetFilters() {
  filters.search = ''
  filters.city = ''
  filters.status = ''
  page.value = 1
  void loadVenues(1)
}

function goToPage(nextPage: number) {
  void loadVenues(nextPage)
}

onMounted(() => {
  void loadVenues()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8" data-testid="backoffice-venues-page">
        <UiPageHeading eyebrow="Backoffice" title="Venues" description="Buscá recintos por nombre, ciudad y estado operativo." />

        <PagesBackofficeOverviewPanel
          eyebrow="Filtros"
          title="Lista de venues"
          description="Filtrá por nombre, ciudad, estado y paginación desde un mismo bloque."
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

          <div :class="[filtersOpen ? 'block' : 'hidden', 'space-y-6', 'lg:block']">
            <PagesBackofficeFiltersBar
              v-model:search="filters.search"
              v-model:city="filters.city"
              v-model:status="filters.status"
              :statuses="statusOptions"
              :visible-filters="['city', 'status']"
              search-label="Buscar recinto"
              search-placeholder="Nombre o dirección"
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
              <BaseSkeleton v-for="index in 6" :key="index" class="h-56 rounded-2xl" />
            </div>

            <UiEmptyState
              v-else-if="integrationStatus === 'pending'"
              icon="i-lucide-plug-zap"
              title="Endpoint de venues todavía no disponible"
              description="El layout, filtros, paginación y estados ya están listos. Al exponer /admin/venues se conectará sin cambios de UI."
            />

            <UiEmptyState
              v-else-if="venues.length === 0"
              icon="i-lucide-building-2"
              title="Sin venues para estos filtros"
              description="No encontramos recintos con los criterios actuales."
            />

            <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <UiPanel
                v-for="venue in venues"
                :key="venue.id"
                variant="glass"
                radius="lg"
                padding="md"
                class="h-full border-default/65 bg-elevated/20"
              >
                <div class="flex h-full flex-col gap-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-base font-semibold text-highlighted">
                        {{ venue.name }}
                      </p>
                      <p class="text-sm text-toned">
                        {{ venue.city }}, {{ venue.country }}
                      </p>
                    </div>

                    <BaseBadge kind="status" size="sm" :color="venue.isActive ? 'success' : 'neutral'">
                      {{ venue.isActive ? 'Activo' : 'Inactivo' }}
                    </BaseBadge>
                  </div>

                  <div class="space-y-2 text-sm">
                    <div class="flex items-center justify-between border-b border-default/60 pb-2">
                      <span class="text-muted">Capacidad</span>
                      <span class="text-toned">{{ venue.capacity ?? 'N/D' }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-muted">Actualizado</span>
                      <span class="text-toned">{{ new Date(venue.updatedAt).toLocaleDateString('es-ES') }}</span>
                    </div>
                  </div>
                </div>
              </UiPanel>
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
  </section>
</template>
