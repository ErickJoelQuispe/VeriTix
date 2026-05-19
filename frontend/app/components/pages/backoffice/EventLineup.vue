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
const roleGroups: Array<{ role: ArtistRole, label: string, icon: string, addLabel: string }> = [
  { role: 'HEADLINER', label: 'Artistas principales', icon: 'i-lucide-star', addLabel: 'Agregar principal' },
  { role: 'SPECIAL_GUEST', label: 'Artistas invitados', icon: 'i-lucide-users', addLabel: 'Agregar invitado' },
  { role: 'OPENER', label: 'Artistas de apertura', icon: 'i-lucide-sun', addLabel: 'Agregar apertura' },
]
interface PopoverState {
  open: boolean
  search: string
  results: Array<{ id: string, name: string }>
}
const popovers = reactive({
  HEADLINER: { open: false, search: '', results: [] } as PopoverState,
  SPECIAL_GUEST: { open: false, search: '', results: [] } as PopoverState,
  OPENER: { open: false, search: '', results: [] } as PopoverState,
})
function artistsByRole(role: ArtistRole) {
  return lineup.value.filter(e => e.role === role)
}
const hasLineup = computed(() => lineup.value.length > 0)
function getArtistAvatarUrl(entry: EventArtistEntry): string | undefined {
  return entry.artist.imageUrl ?? undefined
}
function getArtistInitials(entry: EventArtistEntry): string {
  return entry.artist.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
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
async function loadResults(search: string, role: ArtistRole) {
  try {
    const response = await listArtists({
      pageValue: 1,
      pageSize: 50,
      search,
      genreId: '',
      isActive: 'true',
    })
    popovers[role].results = (response.data ?? []).map(a => ({
      id: a.id,
      name: a.name,
    }))
  }
  catch {
    popovers[role].results = []
  }
}
function onPopoverOpen(role: ArtistRole) {
  popovers[role].search = ''
  popovers[role].results = []
  void loadResults('', role)
}
async function pickArtist(artistId: string, role: ArtistRole) {
  const artist = popovers[role].results.find(a => a.id === artistId)
  if (!artist) {
    return
  }
  popovers[role].open = false
  popovers[role].search = ''
  popovers[role].results = []
  if (props.eventId) {
    try {
      await addToEvent(props.eventId, { artistId, role, performanceOrder: lineup.value.length + 1 })
      await loadLineup()
      emit('change', lineup.value)
    }
    catch {
      // Error handled by apiRequest
    }
  }
  else {
    pendingIdCounter++
    lineup.value = [...lineup.value, {
      id: `pending-${pendingIdCounter}`,
      role,
      performanceOrder: lineup.value.length + 1,
      performanceTime: null,
      eventId: '',
      artist: { id: artistId, name: artist.name, slug: '', imageUrl: null, country: null },
    }]
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
      <div v-if="hasLineup || !loadingLineup" class="mt-4 space-y-8">
        <div
          v-for="group in roleGroups"
          :key="group.role"
          class="rounded-xl border border-default/50 bg-default/10 p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <BaseIcon :name="group.icon" class="size-4 text-lavender" />
              <h4 class="text-sm font-semibold text-highlighted">
                {{ group.label }}
              </h4>
              <span class="rounded-md bg-default/20 px-2 py-0.5 text-xs text-toned/60">{{ artistsByRole(group.role).length }}</span>
            </div>
            <BasePopover
              v-model:open="popovers[group.role].open"
              :content="{ align: 'end', side: 'bottom', sideOffset: 6 }"
              @update:open="(v: boolean) => v && onPopoverOpen(group.role)"
            >
              <BaseButton
                variant="outlined"
                size="xs"
                leading-icon="i-lucide-plus"
                :disabled="disabled"
              >
                {{ group.addLabel }}
              </BaseButton>
              <template #content>
                <div class="min-w-56 space-y-2.5 rounded-2xl border border-default/60 bg-elevated p-4 shadow-xl ring-1 ring-white/5">
                  <div class="relative">
                    <BaseIcon name="i-lucide-search" class="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-toned/50" />
                    <input
                      v-model="popovers[group.role].search"
                      type="text"
                      placeholder="Buscá un artista..."
                      class="w-full rounded-lg border border-default/50 bg-default/25 py-2 pl-8 pr-3 text-sm text-highlighted placeholder:text-toned/50 focus-visible:border-lavender/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender/20"
                      @input="loadResults(popovers[group.role].search, group.role)"
                    >
                  </div>
                  <div class="-mx-1 max-h-48 overflow-y-auto">
                    <p
                      v-if="popovers[group.role].results.length === 0 && popovers[group.role].search.length > 0"
                      class="py-4 text-center text-xs text-toned/50"
                    >
                      Sin resultados
                    </p>
                    <button
                      v-for="artist in popovers[group.role].results"
                      :key="artist.id"
                      type="button"
                      class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-highlighted transition hover:bg-lavender/12 hover:text-lavender"
                      @click="pickArtist(artist.id, group.role)"
                    >
                      <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-lavender/12 text-[0.6rem] font-semibold text-lavender">
                        {{ getInitials(artist.name) }}
                      </span>
                      <span class="truncate">{{ artist.name }}</span>
                    </button>
                  </div>
                </div>
              </template>
            </BasePopover>
          </div>
          <div v-if="artistsByRole(group.role).length > 0" class="mt-3 space-y-2">
            <div
              v-for="entry in artistsByRole(group.role)"
              :key="entry.id"
              class="flex items-center gap-3 rounded-lg border border-default/40 bg-default/15 px-3.5 py-2.5"
            >
              <div class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lavender/12">
                <img
                  v-if="getArtistAvatarUrl(entry)"
                  :src="getArtistAvatarUrl(entry)"
                  :alt="entry.artist.name"
                  class="size-full object-cover"
                >
                <span v-else class="text-xs font-semibold text-lavender">
                  {{ getArtistInitials(entry) }}
                </span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ entry.artist.name }}
                </p>
                <p v-if="entry.artist.country" class="text-xs text-toned/60">
                  {{ entry.artist.country }}
                </p>
              </div>
              <button
                type="button"
                class="flex size-7 shrink-0 items-center justify-center rounded-lg text-toned/40 transition-colors hover:bg-error/15 hover:text-error disabled:opacity-40"
                :disabled="disabled"
                :aria-label="`Eliminar ${entry.artist.name}`"
                @click="removeArtist(entry.id)"
              >
                <BaseIcon name="i-lucide-x" class="size-3.5" />
              </button>
            </div>
          </div>
          <div v-else class="mt-3 py-2 text-center text-xs text-toned/50">
            Sin {{ group.label.toLowerCase() }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
