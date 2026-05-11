<script setup lang="ts">
import { formatEventDate } from '@/utils/date-formatters'

const route = useRoute()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()

const artistId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const { data: artist, status, error } = await usePublicArtist(artistId)

useSeoMeta({
  title: () => (artist.value ? `${artist.value.name} | VeriTix` : 'Artista | VeriTix'),
  description: () => artist.value?.bio ?? 'Detalle del artista en VeriTix.',
})

const todayISO = new Date().toISOString()

const upcomingFilters = computed(() => ({
  artistName: artist.value?.name ?? '',
  dateFrom: todayISO,
  page: 1,
}))

const pastFilters = computed(() => ({
  artistName: artist.value?.name ?? '',
  dateTo: todayISO,
  page: 1,
}))

const { data: upcomingEvents, status: upcomingStatus, error: upcomingError } = await usePublicEvents(upcomingFilters)
const { data: pastEvents, status: pastStatus, error: pastError } = await usePublicEvents(pastFilters)

const genreLabels = computed(() => artist.value?.genres.map(genre => genre.name).join(' · ') ?? '')
const artistErrorStatus = computed(() => (error.value ? getApiErrorStatus(error.value) : undefined))

const artistErrorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  if (artistErrorStatus.value === 404) {
    return 'No encontramos este artista o ya no está disponible.'
  }

  return getApiErrorMessage(error.value, 'No pudimos cargar el artista en este momento.')
})

const upcomingErrorMessage = computed(() => {
  if (!upcomingError.value) {
    return ''
  }

  return getApiErrorMessage(upcomingError.value, 'No pudimos cargar los eventos próximos de este artista.')
})

const pastErrorMessage = computed(() => {
  if (!pastError.value) {
    return ''
  }

  return getApiErrorMessage(pastError.value, 'No pudimos cargar los eventos pasados de este artista.')
})

const upcomingItems = computed(() => upcomingEvents.value?.data ?? [])
const pastItems = computed(() => pastEvents.value?.data ?? [])

const WHITESPACE_RE = /\s+/

function artistInitials(name: string): string {
  return name
    .split(WHITESPACE_RE)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('') || 'A'
}

function formatCreatedAt(value: string | Date): string {
  return formatEventDate(typeof value === 'string' ? value : value.toISOString())
}
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <BaseContainer>
      <div v-if="status === 'pending'" class="space-y-6">
        <BaseSkeleton class="h-16 rounded-2xl" />
        <BaseSkeleton class="h-120 rounded-3xl" />
      </div>

      <div v-else-if="artist" class="mx-auto max-w-7xl space-y-10">
        <NuxtLink to="/artists" class="inline-flex items-center gap-2 text-sm text-toned transition-colors hover:text-highlighted">
          <BaseIcon name="i-lucide-arrow-left" class="size-4" />
          Volver a artistas
        </NuxtLink>

        <div class="grid gap-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div class="overflow-hidden rounded-3xl border border-default/55 bg-elevated/20 shadow-soft">
            <NuxtImg
              v-if="artist.imageUrl"
              :src="artist.imageUrl"
              :alt="`Imagen de ${artist.name}`"
              class="min-h-88 w-full object-cover lg:min-h-[34rem]"
              width="1000"
              height="1200"
              sizes="(max-width: 1023px) 100vw, 40vw"
              placeholder
            />

            <div v-else class="flex min-h-88 items-center justify-center px-8 py-16 text-center lg:min-h-[34rem]">
              <div class="max-w-sm space-y-4">
                <BaseAvatar :text="artistInitials(artist.name)" size="xl" class="mx-auto !size-20 border border-default/55" />
                <div class="space-y-2">
                  <p class="text-lg font-semibold text-highlighted">
                    Sin imagen pública
                  </p>
                  <p class="text-sm leading-relaxed text-toned">
                    Este artista todavía no tiene una imagen cargada en el backend.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <UiPanel as="section" variant="glass" radius="xl" padding="lg" class="space-y-8">
            <div class="space-y-5 border-b border-default/55 pb-7">
              <div class="flex flex-wrap gap-2">
                <BaseBadge kind="status" size="xs" :color="artist.isActive ? 'success' : 'neutral'">
                  {{ artist.isActive ? 'Activo' : 'Inactivo' }}
                </BaseBadge>

                <BaseBadge v-if="artist.country" kind="tag" size="xs">
                  {{ artist.country }}
                </BaseBadge>

                <BaseBadge v-for="genre in artist.genres" :key="genre.id" kind="tag" size="xs">
                  {{ genre.name }}
                </BaseBadge>
              </div>

              <div class="space-y-3">
                <p class="text-xs font-medium tracking-[0.28em] text-muted uppercase">
                  Artista público
                </p>
                <h1 class="font-display text-3xl leading-tight text-highlighted sm:text-4xl lg:text-5xl">
                  {{ artist.name }}
                </h1>
                <p v-if="genreLabels" class="text-sm font-medium tracking-wide text-dimmed uppercase">
                  {{ genreLabels }}
                </p>
              </div>

              <p v-if="artist.bio" class="max-w-3xl text-sm leading-relaxed text-toned sm:text-base">
                {{ artist.bio }}
              </p>
              <p v-else class="text-sm leading-relaxed text-toned">
                No hay biografía pública cargada para este artista.
              </p>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <div class="space-y-2">
                <UiMetaLabel>Slug</UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ artist.slug }}
                </p>
              </div>

              <div class="space-y-2">
                <UiMetaLabel>País</UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ artist.country || 'No informado' }}
                </p>
              </div>

              <div class="space-y-2">
                <UiMetaLabel>Web</UiMetaLabel>
                <BaseButton v-if="artist.website" :href="artist.website" variant="secondary" size="sm" target="_blank" rel="noreferrer" trailing-icon="i-lucide-arrow-up-right" class="w-fit px-4">
                  Abrir sitio
                </BaseButton>
                <p v-else class="text-sm text-toned">
                  No hay sitio web público cargado.
                </p>
              </div>

              <div class="space-y-2">
                <UiMetaLabel>Actualización</UiMetaLabel>
                <p class="text-sm font-semibold text-highlighted">
                  Creado: {{ formatCreatedAt(artist.createdAt) }}
                </p>
                <p class="text-sm font-semibold text-highlighted">
                  Actualizado: {{ formatCreatedAt(artist.updatedAt) }}
                </p>
              </div>
            </div>
          </UiPanel>
        </div>

        <div class="grid gap-8 lg:grid-cols-2">
          <UiPanel as="section" variant="glass" radius="xl" padding="lg" class="space-y-5">
            <div class="space-y-2">
              <UiMetaLabel>Próximos y actuales eventos</UiMetaLabel>
              <p class="text-sm leading-relaxed text-toned">
                Usamos el listado público de eventos filtrado por artista y fecha de inicio.
              </p>
            </div>

            <div v-if="upcomingStatus === 'pending'" class="space-y-3">
              <BaseSkeleton v-for="index in 2" :key="index" class="h-24 rounded-2xl" />
            </div>

            <div v-else-if="upcomingErrorMessage" class="rounded-2xl border border-warning/30 bg-warning/8 px-4 py-4 text-sm leading-relaxed text-toned">
              {{ upcomingErrorMessage }}
            </div>

            <div v-else-if="upcomingItems.length === 0" class="rounded-2xl border border-default/55 bg-elevated/25 px-4 py-4 text-sm leading-relaxed text-toned">
              No hay eventos públicos próximos para este artista.
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
              <UiMetaLabel>Eventos pasados</UiMetaLabel>
              <p class="text-sm leading-relaxed text-toned">
                Historial público de eventos previos usando el mismo listado.
              </p>
            </div>

            <div v-if="pastStatus === 'pending'" class="space-y-3">
              <BaseSkeleton v-for="index in 2" :key="index" class="h-24 rounded-2xl" />
            </div>

            <div v-else-if="pastErrorMessage" class="rounded-2xl border border-warning/30 bg-warning/8 px-4 py-4 text-sm leading-relaxed text-toned">
              {{ pastErrorMessage }}
            </div>

            <div v-else-if="pastItems.length === 0" class="rounded-2xl border border-default/55 bg-elevated/25 px-4 py-4 text-sm leading-relaxed text-toned">
              No hay eventos públicos pasados para este artista.
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
              {{ artistErrorMessage || 'Intentá recargar la página en unos segundos.' }}
            </p>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
