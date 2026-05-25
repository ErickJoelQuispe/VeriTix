<script setup lang="ts">
import type { PaginationMeta } from '~~/shared/api/types'
import type { BackofficeOption, BackofficeVenueRecord } from '~~/shared/types'
import { VENUE_TYPE_LABELS } from '~~/shared/types'
import { useBackofficeVenuesRepository } from '@/repositories/backofficeVenuesRepository'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Recintos | Backoffice VeriTix' })

const { deleteVenue, listVenues } = useBackofficeVenuesRepository()
const { notifyApiError, notifySuccess } = useAppNotifications()

const venues = ref<BackofficeVenueRecord[]>([])
const pending = ref(true)
const deletingId = ref('')
const deletingTarget = ref('')
const deleteModalOpen = ref(false)
const actionMenuOpen = reactive<Record<string, boolean>>({})
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

function venueTypeLabel(type: string): string {
  return VENUE_TYPE_LABELS[type as keyof typeof VENUE_TYPE_LABELS] || type
}

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

    notifyApiError(error, 'No pudimos cargar los recintos.', { id: 'admin-venues-load-error' })
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

function confirmDelete(venueId: string) {
  deletingTarget.value = venueId
  deleteModalOpen.value = true
}

function handleDeleteConfirm() {
  if (deletingTarget.value) {
    removeVenue(deletingTarget.value)
  }

  deleteModalOpen.value = false
}

async function removeVenue(venueId: string) {
  deletingId.value = venueId

  try {
    await deleteVenue(venueId)

    notifySuccess('Recinto eliminado correctamente.', { id: `admin-venues-delete-${venueId}` })
    await loadVenues(page.value)
  }
  catch (error) {
    notifyApiError(error, 'No pudimos eliminar el recinto.', { id: `admin-venues-delete-error-${venueId}` })
  }
  finally {
    deletingId.value = ''
  }
}

onMounted(() => {
  void loadVenues()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8" data-testid="backoffice-venues-page">
        <UiPageHeading
          eyebrow="Backoffice"
          title="Recintos"
          description="Buscá recintos por nombre, ciudad y estado operativo."
          action-label="Nuevo recinto"
          action-to="/backoffice/venues/new"
        />

        <PagesBackofficeOverviewPanel
          eyebrow="Filtros"
          title="Lista de recintos"
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
              action-label="Crear recinto"
              action-to="/backoffice/venues/new"
            />

            <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <UiPanel
                v-for="venue in venues"
                :key="venue.id"
                variant="glass"
                radius="lg"
                padding="md"
                class="group relative h-full border-default/50 bg-linear-to-b from-elevated/25 to-elevated/10 shadow-sm transition hover:border-lavender/20 hover:shadow-md"
              >
                <div class="flex h-full flex-col">
                  <div class="absolute right-3 top-3 z-10">
                    <BasePopover
                      v-model:open="actionMenuOpen[venue.id]"
                      :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
                      class="shrink-0"
                    >
                      <BaseButton
                        variant="secondary"
                        size="sm"
                        class="px-3"
                        :disabled="pending || deletingId === venue.id"
                        aria-label="Abrir acciones"
                      >
                        <BaseIcon name="i-lucide-ellipsis-vertical" class="size-4" aria-hidden="true" />
                      </BaseButton>

                      <template #content>
                        <div class="w-56 rounded-3xl border border-white/10 bg-linear-to-b from-elevated/98 to-elevated/88 p-3 shadow-[0_28px_70px_-34px_rgb(0_0_0/0.82)] ring-1 ring-black/10 backdrop-blur-2xl">
                          <div class="space-y-3">
                            <p class="px-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-toned/55">
                              Acciones
                            </p>

                            <BaseButton
                              variant="primary"
                              size="md"
                              block
                              class="justify-start"
                              :to="`/backoffice/venues/${venue.id}/edit`"
                              @click="actionMenuOpen[venue.id] = false"
                            >
                              <BaseIcon name="i-lucide-pencil" class="size-4" aria-hidden="true" />
                              Editar recinto
                            </BaseButton>

                            <BaseButton
                              variant="danger"
                              size="md"
                              block
                              class="justify-start"
                              :disabled="deletingId === venue.id"
                              @click="actionMenuOpen[venue.id] = false; confirmDelete(venue.id)"
                            >
                              <BaseIcon name="i-lucide-trash-2" class="size-4" aria-hidden="true" />
                              Eliminar recinto
                            </BaseButton>
                          </div>
                        </div>
                      </template>
                    </BasePopover>
                  </div>

                  <div class="flex items-start gap-4 pr-12">
                    <div class="flex min-w-0 items-center gap-3.5">
                      <div class="shrink-0">
                        <div class="flex size-12 items-center justify-center rounded-xl bg-lavender/12 ring-2 ring-default/50">
                          <BaseIcon name="i-lucide-building-2" class="size-6 text-lavender" />
                        </div>
                      </div>

                      <div class="min-w-0 space-y-0.5">
                        <p class="truncate text-base font-semibold text-highlighted">
                          {{ venue.name }}
                        </p>
                        <p class="truncate text-sm text-toned/70">
                          {{ venue.address }}
                        </p>
                        <div class="mt-1.5 flex flex-wrap items-center gap-2">
                          <span class="inline-flex items-center gap-1.5 rounded-full border border-default/45 bg-default/15 px-2 py-0.5 text-[0.68rem] font-medium text-toned/80">
                            <span class="size-1.5 rounded-full" :class="venue.isActive ? 'bg-success' : 'bg-toned/50'" />
                            {{ venue.isActive ? 'Activo' : 'Inactivo' }}
                          </span>

                          <BaseIcon name="i-lucide-tag" class="size-3.5 text-accent" />
                          <span class="text-xs font-medium text-accent">
                            {{ venueTypeLabel(venue.type) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-5 space-y-3">
                    <div class="flex items-center gap-3">
                      <div class="flex size-9 items-center justify-center rounded-lg bg-lavender/10">
                        <BaseIcon name="i-lucide-map-pin" class="size-4 text-lavender" />
                      </div>
                      <div>
                        <p class="text-xs text-toned/50">
                          Ubicación
                        </p>
                        <p class="text-sm text-highlighted">
                          {{ venue.city }}{{ venue.state ? `, ${venue.state}` : '' }}, {{ venue.country }}
                        </p>
                      </div>
                    </div>
                    <div class="border-t border-default/30" />
                    <div class="flex items-center gap-3">
                      <div class="flex size-9 items-center justify-center rounded-lg bg-info/12">
                        <BaseIcon name="i-lucide-users" class="size-4 text-info" />
                      </div>
                      <div>
                        <p class="text-xs text-toned/50">
                          Capacidad
                        </p>
                        <p class="text-sm font-medium text-highlighted">
                          {{ venue.capacity ? venue.capacity.toLocaleString('es-ES') : 'Sin especificar' }}
                        </p>
                      </div>
                    </div>
                    <div class="border-t border-default/30" />
                    <div class="flex items-center gap-3">
                      <div class="flex size-9 items-center justify-center rounded-lg" :class="venue.website ? 'bg-success/12' : 'bg-toned/8'">
                        <BaseIcon name="i-lucide-globe" class="size-4" :class="venue.website ? 'text-success' : 'text-toned/50'" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs text-toned/50">
                          Sitio web
                        </p>
                        <p class="truncate text-sm text-highlighted">
                          {{ venue.website || 'No informado' }}
                        </p>
                      </div>
                    </div>
                    <div class="border-t border-default/30" />
                    <div class="flex items-center gap-3">
                      <div class="flex size-9 items-center justify-center rounded-lg bg-toned/8">
                        <BaseIcon name="i-lucide-clock-3" class="size-4 text-toned/50" />
                      </div>
                      <div>
                        <p class="text-xs text-toned/50">
                          Última actualización
                        </p>
                        <p class="text-sm text-highlighted">
                          {{ new Date(venue.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </UiPanel>
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
          </div>
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>

    <UiConfirmModal
      :open="deleteModalOpen"
      title="Eliminar recinto"
      description="¿Estás seguro de que querés eliminar este recinto? Esta acción no se puede deshacer."
      confirm-label="Eliminar"
      cancel-label="Cancelar"
      :pending="deletingId === deletingTarget"
      @confirm="handleDeleteConfirm"
      @cancel="deleteModalOpen = false; deletingTarget = ''"
    />
  </section>
</template>
