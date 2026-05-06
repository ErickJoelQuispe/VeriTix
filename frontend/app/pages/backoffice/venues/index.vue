<script setup lang="ts">
import type { BackofficeOption, BackofficeVenueRecord, PaginatedMeta } from '~/types'
import { useBackofficeVenuesRepository } from '~/repositories/backofficeVenuesRepository'

definePageMeta({ middleware: 'backoffice' })
useSeoMeta({ title: 'Venues | Backoffice VeriTix' })

const { listVenues } = useBackofficeVenuesRepository()
const { notifyApiError } = useAppNotifications()

const venues = ref<BackofficeVenueRecord[]>([])
const pending = ref(true)
const integrationStatus = ref<'connected' | 'pending'>('connected')

const page = ref(1)
const pageSize = ref(12)

const meta = ref<PaginatedMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 })

const statusOptions: BackofficeOption[] = [
  { id: 'true', name: 'Activo' },
  { id: 'false', name: 'Inactivo' },
]

const filters = reactive({
  search: '',
  city: '',
  isActive: '',
})

const toolbarChips = computed(() => {
  const activeCount = venues.value.filter(venue => venue.isActive).length
  return [
    { label: 'visibles', value: meta.value.total },
    { label: 'activos', value: activeCount },
    { label: 'integración', value: integrationStatus.value === 'connected' ? 'lista' : 'pendiente' },
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
      isActive: filters.isActive,
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
      meta.value = { total: 0, page: 1, limit: pageSize.value, totalPages: 1 }
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
  filters.isActive = ''
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
  <BackofficePageShell
    title="Manage venues"
    description="Availability, capacity, and operational status in one place."
  >
    <div class="mx-auto max-w-7xl space-y-8" data-testid="backoffice-venues-page">
      <section class="grid gap-3 rounded-2xl border border-default/70 bg-elevated/45 p-4 md:grid-cols-[1.25fr_.72fr_.72fr_auto]">
        <FormInput v-model="filters.search" placeholder="Search venue or city" icon="i-lucide-search" :disabled="pending" />
        <FormSelect label="Status" name="status" :model-value="filters.isActive || '__all__'" :items="[{ label: 'Status: all', value: '__all__' }, ...statusOptions.map(status => ({ label: status.name, value: status.id }))]" :disabled="pending" @update:model-value="filters.isActive = $event === '__all__' ? '' : String($event)" />
        <FormInput v-model="filters.city" placeholder="City" icon="i-lucide-map-pin" :disabled="pending" />
        <BaseButton kind="secondary" :loading="pending" @click="applyFilters">
          Search
        </BaseButton>
      </section>

      <BackofficeOverviewPanel
        eyebrow="Filter"
        title="Refine list."
        description="Availability, capacity, and operational status in one place."
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
            v-model:city="filters.city"
            v-model:format-id="filters.isActive"
            :formats="statusOptions"
            :visible-filters="['city', 'format']"
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
            <UiGlassPanel
              v-for="venue in venues"
              :key="venue.id"
              tone="subtle"
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
            </UiGlassPanel>
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
