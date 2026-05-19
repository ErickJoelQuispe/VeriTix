<script setup lang="ts">
import type { ArtistRole, EventArtistEntry } from '~~/shared/types'
import { useBackofficeArtistsRepository } from '@/repositories/backofficeArtistsRepository'
import { useEventArtistsRepository } from '@/repositories/eventArtistsRepository'

const props = withDefaults(defineProps<{
  eventId?: string
  disabled?: boolean
}>(), {
  eventId: undefined,
  disabled: false,
})

const emit = defineEmits<{
  change: [artists: EventArtistEntry[]]
}>()

const { listByEvent, addToEvent, removeFromEvent } = useEventArtistsRepository()
const { listArtists } = useBackofficeArtistsRepository()

const lineup = ref<EventArtistEntry[]>([])
const loadingLineup = ref(false)
let pendingIdCounter = 0
const artistSearch = ref('')
const artistResults = ref<Array<{ id: string, name: string }>>([])
const searching = ref(false)
const addOpen = ref(false)
const selectedArtistId = ref('')
const selectedRole = ref<ArtistRole>('HEADLINER')

const roleOptions: Array<{ label: string, value: ArtistRole }> = [
  { label: 'Artista principal', value: 'HEADLINER' },
  { label: 'Artista invitado', value: 'SPECIAL_GUEST' },
  { label: 'Artista de apertura', value: 'OPENER' },
]

const roleGroups: Array<{ role: ArtistRole, label: string }> = [
  { role: 'HEADLINER', label: 'Artistas principales' },
  { role: 'SPECIAL_GUEST', label: 'Artistas invitados' },
  { role: 'OPENER', label: 'Artistas de apertura' },
]

function artistsByRole(role: ArtistRole) {
  return lineup.value.filter(e => e.role === role)
}

const hasLineup = computed(() => lineup.value.length > 0)

const filteredArtistResults = computed(() => {
  if (!artistSearch.value.trim()) {
    return artistResults.value
  }

  const q = artistSearch.value.toLowerCase()
  return artistResults.value.filter(a => a.name.toLowerCase().includes(q))
})

function getArtistAvatarUrl(entry: EventArtistEntry): string | undefined {
  return entry.artist.imageUrl ?? undefined
}

function getArtistInitials(entry: EventArtistEntry): string {
  return entry.artist.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

async function loadLineup() {
  if (!props.eventId) {
    lineup.value = []
    loadingLineup.value = false
    return
  }

  loadingLineup.value = true

  try {
    lineup.value = await listByEvent(props.eventId)
  }
  finally {
    loadingLineup.value = false
  }
}

async function searchArtists(search = '') {
  searching.value = true

  try {
    const response = await listArtists({
      pageValue: 1,
      pageSize: 50,
      search,
      genreId: '',
      isActive: 'true',
    })

    artistResults.value = (response.data ?? []).map(a => ({
      id: a.id,
      name: a.name,
    }))
  }
  catch {
    artistResults.value = []
  }
  finally {
    searching.value = false
  }
}

async function addArtist() {
  if (!selectedArtistId.value) {
    return
  }

  const artist = artistResults.value.find(a => a.id === selectedArtistId.value)

  if (!artist) {
    return
  }

  if (props.eventId) {
    try {
      await addToEvent(props.eventId, {
        artistId: selectedArtistId.value,
        role: selectedRole.value,
        performanceOrder: lineup.value.length + 1,
      })

      selectedArtistId.value = ''
      selectedRole.value = 'HEADLINER'
      artistSearch.value = ''
      addOpen.value = false
      await loadLineup()
      emit('change', lineup.value)
    }
    catch {
      // Error handled by apiRequest
    }
  }
  else {
    pendingIdCounter++

    const entry: EventArtistEntry = {
      id: `pending-${pendingIdCounter}`,
      role: selectedRole.value,
      performanceOrder: lineup.value.length + 1,
      performanceTime: null,
      eventId: '',
      artist: {
        id: selectedArtistId.value,
        name: artist.name,
        slug: '',
        imageUrl: null,
        country: null,
      },
    }

    lineup.value = [...lineup.value, entry]
    selectedArtistId.value = ''
    selectedRole.value = 'HEADLINER'
    artistSearch.value = ''
    addOpen.value = false
    emit('change', lineup.value)
  }
}

async function removeArtist(entryId: string) {
  if (props.eventId) {
    try {
      await removeFromEvent(props.eventId, entryId)
      await loadLineup()
      emit('change', lineup.value)
    }
    catch {
      // Error handled by apiRequest
    }
  }
  else {
    lineup.value = lineup.value.filter(e => e.id !== entryId)
    emit('change', lineup.value)
  }
}

function openAdd() {
  addOpen.value = true
  searchArtists()
}

function selectArtist(artistId: string) {
  selectedArtistId.value = artistId
  const artist = artistResults.value.find(a => a.id === artistId)

  if (artist) {
    artistSearch.value = artist.name
  }
}

watch(() => props.eventId, (id) => {
  if (id) {
    loadLineup()
  }
  else {
    lineup.value = []
  }
}, { immediate: true })
</script>

<template>
  <div class="border-t border-default/55 pt-6">
    <UiMetaLabel as="span">
      Lineup de artistas
    </UiMetaLabel>

    <div v-if="loadingLineup" class="mt-4 flex items-center gap-3 py-6">
      <BaseIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-lavender" />
      <span class="text-sm text-toned">Cargando lineup...</span>
    </div>

    <template v-else>
      <div v-if="hasLineup" class="mt-4 space-y-6">
        <div v-for="group in roleGroups" :key="group.role">
          <div v-if="artistsByRole(group.role).length > 0">
            <h4 class="text-xs font-semibold uppercase tracking-[0.12em] text-toned/60">
              {{ group.label }}
            </h4>

            <div class="mt-2 space-y-2">
              <div
                v-for="entry in artistsByRole(group.role)"
                :key="entry.id"
                class="flex items-center gap-3 rounded-xl border border-default/50 bg-default/15 px-4 py-3"
              >
                <div class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lavender/15">
                  <img
                    v-if="getArtistAvatarUrl(entry)"
                    :src="getArtistAvatarUrl(entry)"
                    :alt="entry.artist.name"
                    class="size-full object-cover"
                  >
                  <span
                    v-else
                    class="text-xs font-semibold text-lavender"
                  >
                    {{ getArtistInitials(entry) }}
                  </span>
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-highlighted">
                    {{ entry.artist.name }}
                  </p>
                  <div v-if="entry.artist.country" class="flex items-center gap-1 text-xs text-toned/70">
                    <BaseIcon name="i-lucide-map-pin" class="size-3" />
                    <span>{{ entry.artist.country }}</span>
                  </div>
                </div>

                <button
                  type="button"
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg text-toned/50 transition-colors hover:bg-error/15 hover:text-error disabled:opacity-40"
                  :disabled="disabled"
                  :aria-label="`Eliminar ${entry.artist.name} del lineup`"
                  @click="removeArtist(entry.id)"
                >
                  <BaseIcon name="i-lucide-x" class="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="!loadingLineup"
        class="mt-4 rounded-xl border border-dashed border-default/40 bg-default/10 px-4 py-8 text-center text-sm text-toned/60"
      >
        <BaseIcon name="i-lucide-music" class="mx-auto mb-2 size-8 text-toned/30" />
        <p>No hay artistas en el lineup.</p>
      </div>
    </template>

    <div class="mt-4">
      <BaseButton
        v-if="!addOpen"
        variant="outlined"
        size="sm"
        leading-icon="i-lucide-plus"
        :disabled="disabled"
        @click="openAdd"
      >
        Agregar artista
      </BaseButton>
    </div>

    <div v-if="addOpen" class="mt-4 space-y-4 rounded-xl border border-lavender/20 bg-lavender/5 p-5">
      <p class="text-xs font-semibold uppercase tracking-[0.12em] text-lavender/80">
        Agregar al lineup
      </p>

      <div class="space-y-3">
        <div class="relative">
          <label class="mb-1.5 block text-xs font-medium text-toned/70">Artista</label>
          <input
            v-model="artistSearch"
            type="text"
            placeholder="Buscá un artista..."
            class="w-full rounded-xl border border-default/55 bg-default/30 px-4 py-2.5 text-sm text-highlighted placeholder:text-toned/60 shadow-sm transition focus-visible:border-lavender/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/35"
            :disabled="disabled"
            @input="searchArtists(artistSearch)"
          >

          <div
            v-if="artistSearch.length > 0 || filteredArtistResults.length > 0"
            class="absolute left-0 top-full z-10 mt-1.5 max-h-48 w-full overflow-auto rounded-xl border border-lavender/25 bg-elevated p-1 shadow-lg"
          >
            <p
              v-if="filteredArtistResults.length === 0"
              class="px-3 py-3 text-center text-sm text-toned/60"
            >
              Sin resultados
            </p>

            <button
              v-for="artist in filteredArtistResults"
              :key="artist.id"
              type="button"
              class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-lavender/10 hover:text-lavender"
              :class="selectedArtistId === artist.id ? 'bg-lavender/12 text-lavender' : 'text-highlighted'"
              @click="selectArtist(artist.id)"
            >
              <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-lavender/12 text-xs font-semibold text-lavender">
                {{ artist.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) }}
              </span>
              <span>{{ artist.name }}</span>
              <BaseIcon v-if="selectedArtistId === artist.id" name="i-lucide-check" class="ml-auto size-4 shrink-0 text-lavender" />
            </button>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-medium text-toned/70">Rol en el evento</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in roleOptions"
              :key="option.value"
              type="button"
              class="rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition"
              :class="selectedRole === option.value
                ? 'border-lavender/40 bg-lavender/12 text-lavender ring-1 ring-lavender/25'
                : 'border-default/55 bg-default/20 text-toned/70 hover:border-lavender/30 hover:text-lavender'"
              @click="selectedRole = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex gap-2 pt-1">
        <BaseButton
          variant="primary"
          size="sm"
          :disabled="!selectedArtistId || disabled"
          @click="addArtist"
        >
          Agregar al lineup
        </BaseButton>
        <BaseButton
          variant="outlined"
          size="sm"
          :disabled="disabled"
          @click="addOpen = false"
        >
          Cancelar
        </BaseButton>
      </div>
    </div>
  </div>
</template>
