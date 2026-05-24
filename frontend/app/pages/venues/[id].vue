<script setup lang="ts">
import { formatEventDate } from '@/utils/date-formatters'

const route = useRoute()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()

const venueId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const { data: venue, status, error } = await usePublicVenue(venueId)

useSeoMeta({
  title: () => (venue.value ? `${venue.value.name} | VeriTix` : 'Venue | VeriTix'),
  description: () => venue.value?.address ?? 'Detalle del venue en VeriTix.',
})

const todayISO = new Date().toISOString()

const upcomingFilters = computed(() => ({
  venueName: venue.value?.name ?? '',
  dateFrom: todayISO,
  page: 1,
}))

const pastFilters = computed(() => ({
  venueName: venue.value?.name ?? '',
  dateTo: todayISO,
  page: 1,
}))

const { data: upcomingEvents, status: upcomingStatus, error: upcomingError } = await usePublicEvents(upcomingFilters)
const { data: pastEvents, status: pastStatus, error: pastError } = await usePublicEvents(pastFilters)

const venueErrorStatus = computed(() => (error.value ? getApiErrorStatus(error.value) : undefined))

const venueErrorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  if (venueErrorStatus.value === 404) {
    return 'No encontramos este venue o ya no está disponible.'
  }

  return getApiErrorMessage(error.value, 'No pudimos cargar el venue en este momento.')
})

const upcomingItems = computed(() => upcomingEvents.value?.data ?? [])
const pastItems = computed(() => pastEvents.value?.data ?? [])

const upcomingErrorMessage = computed(() => {
  if (!upcomingError.value) {
    return ''
  }

  return getApiErrorMessage(upcomingError.value, 'No pudimos cargar los eventos próximos de este venue.')
})

const pastErrorMessage = computed(() => {
  if (!pastError.value) {
    return ''
  }

  return getApiErrorMessage(pastError.value, 'No pudimos cargar los eventos pasados de este venue.')
})

const WHITESPACE_RE = /\s+/

function venueInitials(name: string): string {
  return name
    .split(WHITESPACE_RE)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('') || 'V'
}

function formatCreatedAt(value: string | Date): string {
  return formatEventDate(typeof value === 'string' ? value : value.toISOString())
}
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <BaseContainer>
      <div v-if="status === 'pending'" class="space-y-6">
        <BaseSpinner class="h-16 rounded-2xl" />
        <BaseSpinner class="h-120 rounded-3xl" />
      </div>

      <div v-else-if="venue" class="mx-auto max-w-7xl space-y-10">
        <NuxtLink to="/venues" class="inline-flex items-center gap-2 text-sm text-toned transition-colors hover:text-highlighted">
          <BaseIcon name="i-lucide-arrow-left" class="size-4" />
          Volver a venues
        </NuxtLink>

        <div class="grid gap-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div class="overflow-hidden rounded-3xl border border-default/55 bg-elevated/20 shadow-sm">
            <NuxtImg
              v-if="venue.imageUrl"
              :src="venue.imageUrl"
              :alt="`Imagen de ${venue.name}`"
              class="min-h-88 w-full object-cover lg:min-h-136"
              width="1000"
              height="1200"
              sizes="(max-width: 1023px) 100vw, 40vw"
              placeholder
            />

            <div v-else class="flex min-h-88 items-center justify-center px-8 py-16 text-center lg:min-h-136">
              <div class="max-w-sm space-y-4">
                <BaseAvatar :text="venueInitials(venue.name)" size="xl" class="mx-auto size-20! border border-default/55" />
                <div class="space-y-2">
                  <p class="text-lg font-semibold text-highlighted">
                    Sin imagen pública
                  </p>
                  <p class="text-sm leading-relaxed text-toned">
                    Este venue todavía no tiene una imagen cargada en el backend.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <UiPanel as="section" variant="glass" radius="xl" padding="lg" class="space-y-8">
            <div class="space-y-5 border-b border-default/55 pb-7">
              <div class="flex flex-wrap gap-2">
                <BaseBadge kind="status" size="xs" :color="venue.isActive ? 'success' : 'neutral'">
                  {{ venue.isActive ? 'Activo' : 'Inactivo' }}
                </BaseBadge>

                <BaseBadge kind="tag" size="xs">
                  {{ venue.type }}
                </BaseBadge>

                <BaseBadge kind="tag" size="xs">
                  {{ venue.country }}
                </BaseBadge>
              </div>

              <div class="space-y-3">
                <p class="text-xs font-medium tracking-[0.28em] text-muted uppercase">
                  Venue público
                </p>
                <h1 class="font-display text-3xl leading-tight text-highlighted sm:text-4xl lg:text-5xl">
                  {{ venue.name }}
                </h1>
                <p class="text-sm font-medium tracking-wide text-dimmed uppercase">
                  {{ venue.city }} · {{ venue.state || 'Sin estado/provincia informado' }}
                </p>
              </div>

              <p class="max-w-3xl text-sm leading-relaxed text-toned sm:text-base">
                {{ venue.address }}
              </p>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <div class="space-y-2">
                <UiMetaLabel>Slug</UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ venue.slug }}
                </p>
              </div>

              <div class="space-y-2">
                <UiMetaLabel>Capacidad</UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ venue.capacity !== null ? `${venue.capacity.toLocaleString('es-ES')} personas` : 'No informada' }}
                </p>
              </div>

              <div class="space-y-2">
                <UiMetaLabel>Web</UiMetaLabel>
                <BaseButton v-if="venue.website" :href="venue.website" variant="secondary" size="sm" target="_blank" rel="noreferrer" trailing-icon="i-lucide-arrow-up-right" class="w-fit px-4">
                  Abrir sitio
                </BaseButton>
                <p v-else class="text-sm text-toned">
                  No hay sitio web público cargado.
                </p>
              </div>

              <div class="space-y-2">
                <UiMetaLabel>Actualización</UiMetaLabel>
                <p class="text-sm font-semibold text-highlighted">
                  Creado: {{ formatCreatedAt(venue.createdAt) }}
                </p>
                <p class="text-sm font-semibold text-highlighted">
                  Actualizado: {{ formatCreatedAt(venue.updatedAt) }}
                </p>
              </div>
            </div>
          </UiPanel>
        </div>

        <div class="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <UiPanel as="section" variant="glass" radius="xl" padding="lg" class="space-y-5">
            <div class="space-y-2">
              <UiMetaLabel>Eventos relacionados</UiMetaLabel>
              <p class="text-sm leading-relaxed text-toned">
                Mostramos el catálogo público filtrado por venue y fecha.
              </p>
            </div>

            <div v-if="upcomingStatus === 'pending'" class="space-y-3">
              <BaseSpinner v-for="index in 2" :key="index" class="h-24 rounded-2xl" />
            </div>

            <div v-else-if="upcomingErrorMessage" class="rounded-2xl border border-warning/30 bg-warning/8 px-4 py-4 text-sm leading-relaxed text-toned">
              {{ upcomingErrorMessage }}
            </div>

            <div v-else-if="upcomingItems.length === 0" class="rounded-2xl border border-default/55 bg-elevated/25 px-4 py-4 text-sm leading-relaxed text-toned">
              No hay eventos públicos próximos para este venue.
            </div>

            <div v-else class="space-y-3">
              <UiPanel v-for="event in upcomingItems" :key="event.id" as="article" radius="lg" padding="md" class="space-y-3">
                <div class="flex items-start justify-between gap-4">
                  <div class="space-y-1">
                    <p class="text-xs tracking-[0.24em] text-muted uppercase">
                      {{ formatEventDate(event.dateISO) }}
                    </p>
                    <h3 class="text-lg font-semibold text-highlighted">
                      {{ event.name }}
                    </h3>
                    <p class="text-sm text-toned">
                      {{ event.venue.name }} · {{ event.venue.city }}
                    </p>
                  </div>

                  <BaseButton :to="`/events/${event.id}`" variant="outlined" size="sm" class="shrink-0">
                    Ver evento
                  </BaseButton>
                </div>
              </UiPanel>
            </div>
          </UiPanel>

          <UiPanel as="section" variant="glass" radius="xl" padding="lg" class="space-y-5">
            <div class="space-y-2">
              <UiMetaLabel>Artistas en este venue</UiMetaLabel>
              <p class="text-sm leading-relaxed text-toned">
                El backend público todavía no expone una vista directa de artistas por venue.
              </p>
            </div>

            <div class="rounded-2xl border border-default/55 bg-elevated/25 px-4 py-4 text-sm leading-relaxed text-toned">
              Si necesitás esa relación, hace falta una API pública dedicada para artistas por venue.
            </div>

            <div class="space-y-4 border-t border-default/55 pt-6">
              <UiMetaLabel>Eventos pasados</UiMetaLabel>

              <div v-if="pastStatus === 'pending'" class="space-y-3">
                <BaseSpinner v-for="index in 2" :key="index" class="h-24 rounded-2xl" />
              </div>

              <div v-else-if="pastErrorMessage" class="rounded-2xl border border-warning/30 bg-warning/8 px-4 py-4 text-sm leading-relaxed text-toned">
                {{ pastErrorMessage }}
              </div>

              <div v-else-if="pastItems.length === 0" class="rounded-2xl border border-default/55 bg-elevated/25 px-4 py-4 text-sm leading-relaxed text-toned">
                No hay eventos públicos pasados para este venue.
              </div>

              <div v-else class="space-y-3">
                <UiPanel v-for="event in pastItems" :key="event.id" as="article" radius="lg" padding="md" class="space-y-3">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <p class="text-xs tracking-[0.24em] text-muted uppercase">
                        {{ formatEventDate(event.dateISO) }}
                      </p>
                      <h3 class="text-lg font-semibold text-highlighted">
                        {{ event.name }}
                      </h3>
                      <p class="text-sm text-toned">
                        {{ event.venue.name }} · {{ event.venue.city }}
                      </p>
                    </div>

                    <BaseButton :to="`/events/${event.id}`" variant="outlined" size="sm" class="shrink-0">
                      Ver evento
                    </BaseButton>
                  </div>
                </UiPanel>
              </div>
            </div>
          </UiPanel>
        </div>
      </div>

      <div v-else class="rounded-2xl border border-error/30 bg-error/8 px-6 py-16 text-center">
        <div class="mx-auto flex max-w-md flex-col items-center gap-4">
          <BaseIcon name="i-lucide-cloud-off" class="size-8 text-error" />
          <div class="space-y-2">
            <p class="text-lg font-semibold text-highlighted">
              No pudimos preparar esta vista.
            </p>
            <p class="text-sm leading-relaxed text-toned">
              {{ venueErrorMessage || 'Intentá recargar la página en unos segundos.' }}
            </p>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
