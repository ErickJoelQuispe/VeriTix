<script setup lang="ts">
import { formatEventDate } from '@/utils/date-formatters'

const route = useRoute()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()

const eventId = computed(() => {
  return typeof route.params.id === 'string' ? route.params.id : ''
})

const { data: event, status, error } = await usePublicEvent(eventId)

useSeoMeta({
  title: () => event.value ? `${event.value.name} | VeriTix` : 'Evento | VeriTix',
  description: () => event.value?.description ?? 'Detalle del evento en VeriTix.',
})

const eventDate = computed(() => {
  return event.value ? formatEventDate(event.value.dateISO) : ''
})

const eventLocation = computed(() => {
  if (!event.value) {
    return ''
  }

  return `${event.value.venue.city} · ${event.value.venue.name}`
})

const doorsOpen = computed(() => {
  return event.value?.doorsOpenISO ? formatEventDate(event.value.doorsOpenISO) : 'Por confirmar'
})

const genreLabels = computed(() => {
  return event.value?.genres.map(genre => genre.name).join(' · ') ?? ''
})

const eventErrorStatus = computed(() => {
  return error.value ? getApiErrorStatus(error.value) : undefined
})

const eventErrorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  if (eventErrorStatus.value === 404) {
    return 'No encontramos este evento o ya no está disponible.'
  }

  return getApiErrorMessage(error.value, 'No pudimos cargar el evento en este momento.')
})
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute inset-x-0 top-0 h-56 bg-linear-to-b from-primary/10 via-transparent to-transparent" />
      <div class="absolute -left-12 top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute right-0 top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
    </div>

    <BaseContainer>
      <div v-if="status === 'pending'" class="space-y-6">
        <BaseSkeleton class="h-16 rounded-2xl" />
        <BaseSkeleton class="h-120 rounded-2xl" />
      </div>

      <div v-else-if="eventErrorMessage" class="rounded-2xl px-6 py-16 text-center" :class="eventErrorStatus === 404 ? 'border border-default/65 bg-default/8' : 'border border-error/30 bg-error/8'">
        <div class="mx-auto flex max-w-md flex-col items-center gap-4">
          <BaseIcon :name="eventErrorStatus === 404 ? 'i-lucide-search-x' : 'i-lucide-cloud-off'" class="size-8" :class="eventErrorStatus === 404 ? 'text-dimmed' : 'text-error'" />
          <div class="space-y-2">
            <p class="text-lg font-semibold text-highlighted">
              {{ eventErrorStatus === 404 ? 'No encontramos este evento.' : 'No pudimos cargar el evento.' }}
            </p>
            <p class="text-sm leading-relaxed text-toned">
              {{ eventErrorMessage }}
            </p>
          </div>
        </div>
      </div>

      <div v-else-if="event" class="relative mx-auto max-w-6xl space-y-8">
        <NuxtLink to="/events" class="inline-flex items-center gap-2 text-sm text-toned transition-colors hover:text-highlighted">
          <BaseIcon name="i-lucide-arrow-left" class="size-4" />
          Volver a eventos
        </NuxtLink>

        <div class="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <UiPanel class="overflow-hidden" radius="lg">
            <NuxtImg
              :src="event.imageUrl ?? undefined"
              :alt="`Imagen de ${event.name}`"
              class="min-h-88 w-full rounded-xl object-cover lg:min-h-136"
              width="1200"
              height="1600"
              sizes="(max-width: 1023px) 100vw, 58vw"
              placeholder
            />
          </UiPanel>

          <div class="space-y-8">
            <div class="space-y-5 border-b border-default/55 pb-7">
              <div class="flex flex-wrap gap-2">
                <BaseBadge
                  v-for="genre in event.genres"
                  :key="genre.id"
                  kind="tag"
                  size="xs"
                >
                  {{ genre.name }}
                </BaseBadge>
              </div>

              <div class="space-y-3">
                <h1 class="font-display text-3xl leading-tight text-highlighted sm:text-4xl lg:text-5xl">
                  {{ event.name }}
                </h1>

                <p v-if="genreLabels" class="text-sm font-medium tracking-wide text-dimmed uppercase">
                  {{ genreLabels }}
                </p>
              </div>
            </div>

            <div class="grid gap-8 border-b border-default/55 pb-8 sm:grid-cols-2">
              <div class="space-y-2">
                <UiMetaLabel>
                  Fecha
                </UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ eventDate }}
                </p>
              </div>

              <div class="space-y-2">
                <UiMetaLabel>
                  Puertas
                </UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ doorsOpen }}
                </p>
              </div>

              <div class="space-y-2 sm:col-span-2">
                <UiMetaLabel>
                  Ubicación
                </UiMetaLabel>
                <p class="text-base font-semibold text-highlighted">
                  {{ eventLocation }}
                </p>
                <p class="text-sm text-toned">
                  {{ event.venue.address }}
                </p>
              </div>
            </div>

            <div class="space-y-5 border-b border-default/55 pb-8">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <UiMetaLabel>
                    Reserva
                  </UiMetaLabel>
                  <p class="mt-2 text-sm text-toned">
                    {{ event.venue.name }}
                  </p>
                </div>

                <BaseButton variant="primary" size="lg" class="px-6">
                  Reservar
                </BaseButton>
              </div>
            </div>

            <div v-if="event.description" class="space-y-3">
              <UiMetaLabel>
                Detalle
              </UiMetaLabel>
              <p class="max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
                {{ event.description }}
              </p>
            </div>
          </div>
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
              Intentá recargar la página en unos segundos.
            </p>
          </div>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
