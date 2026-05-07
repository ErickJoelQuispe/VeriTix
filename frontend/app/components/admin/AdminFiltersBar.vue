<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  search?: string
  searchLabel?: string
  searchName?: string
  searchPlaceholder?: string
  searchIcon?: string
  city?: string
  cityLabel?: string
  cityName?: string
  cityPlaceholder?: string
  artistName?: string
  artistLabel?: string
  artistFieldName?: string
  artistPlaceholder?: string
  pageSize?: number
  pageSizeOptions?: Array<{ label: string, value: string | number }>
  pageSizeLabel?: string
  pageSizeName?: string
  genreId?: string
  genreLabel?: string
  genreAllLabel?: string
  genreName?: string
  formatId?: string
  formatLabel?: string
  formatName?: string
  dateFrom?: string
  dateFromLabel?: string
  dateFromName?: string
  dateTo?: string
  dateToLabel?: string
  dateToName?: string
  genres?: Array<{ id: string, name: string }>
  formats?: Array<{ id: string, name: string }>
  loading?: boolean
  visibleFilters?: Array<'city' | 'artistName' | 'pageSize' | 'genre' | 'format' | 'dateRange'>
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
  searchLabel: 'Buscar evento',
  searchName: 'search',
  searchPlaceholder: '',
  searchIcon: 'i-lucide-search',
  city: '',
  cityLabel: 'Ciudad',
  cityName: 'city',
  cityPlaceholder: '',
  artistName: '',
  artistLabel: 'Artista',
  artistFieldName: 'artistName',
  artistPlaceholder: '',
  pageSize: 12,
  pageSizeOptions: () => [],
  pageSizeLabel: 'Por página',
  pageSizeName: 'pageSize',
  genreId: '',
  genreLabel: 'Género',
  genreAllLabel: 'Todos los géneros',
  genreName: 'genreId',
  formatId: '',
  formatLabel: 'Formato',
  formatName: 'formatId',
  dateFrom: '',
  dateFromLabel: 'Desde',
  dateFromName: 'dateFrom',
  dateTo: '',
  dateToLabel: 'Hasta',
  dateToName: 'dateTo',
  genres: () => [],
  formats: () => [],
  loading: false,
  visibleFilters: () => ['city', 'artistName', 'pageSize', 'genre', 'format', 'dateRange'],
})

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:city', value: string): void
  (e: 'update:artistName', value: string): void
  (e: 'update:pageSize', value: number): void
  (e: 'update:genreId', value: string): void
  (e: 'update:formatId', value: string): void
  (e: 'update:dateFrom', value: string): void
  (e: 'update:dateTo', value: string): void
}>()

const ALL_OPTION_VALUE = '__all__'

const genreOptions = computed(() => {
  return [
    { label: props.genreAllLabel, value: ALL_OPTION_VALUE },
    ...props.genres.map(g => ({ label: g.name, value: g.id })),
  ]
})

const formatOptions = computed(() => {
  return [
    { label: 'Todos los formatos', value: ALL_OPTION_VALUE },
    ...props.formats.map(f => ({ label: f.name, value: f.id })),
  ]
})

const selectedGenreId = computed({
  get: () => props.genreId || ALL_OPTION_VALUE,
  set: (value: string) => emit('update:genreId', value === ALL_OPTION_VALUE ? '' : value),
})

const selectedFormatId = computed({
  get: () => props.formatId || ALL_OPTION_VALUE,
  set: (value: string) => emit('update:formatId', value === ALL_OPTION_VALUE ? '' : value),
})

const showCity = computed(() => props.visibleFilters.includes('city'))
const showArtistName = computed(() => props.visibleFilters.includes('artistName'))
const showPageSize = computed(() => props.visibleFilters.includes('pageSize'))
const showGenre = computed(() => props.visibleFilters.includes('genre'))
const showFormat = computed(() => props.visibleFilters.includes('format'))
const showDateRange = computed(() => props.visibleFilters.includes('dateRange'))

const textFiltersGridClass = computed(() => {
  const visibleColumns = 1 + Number(showCity.value) + Number(showArtistName.value) + Number(showPageSize.value)

  if (visibleColumns >= 3) {
    return 'md:grid-cols-3'
  }

  if (visibleColumns === 2) {
    return 'md:grid-cols-2'
  }

  return 'md:grid-cols-1'
})

const secondaryFiltersCount = computed(() => {
  const dateColumns = showDateRange.value ? 2 : 0
  return dateColumns + Number(showGenre.value) + Number(showFormat.value)
})

const secondaryFiltersGridClass = computed(() => {
  if (secondaryFiltersCount.value >= 4) {
    return 'md:grid-cols-4'
  }

  if (secondaryFiltersCount.value === 3) {
    return 'md:grid-cols-3'
  }

  if (secondaryFiltersCount.value === 2) {
    return 'md:grid-cols-2'
  }

  return 'md:grid-cols-1'
})
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <!-- Row 1: Text search filters -->
    <div class="grid grid-cols-1 items-end gap-4" :class="textFiltersGridClass">
      <BaseFormField
        :name="searchName"
        :label="searchLabel"
        :model-value="search"
        :placeholder="searchPlaceholder"
        :icon="searchIcon"
        :disabled="loading"
        @update:model-value="$emit('update:search', String($event ?? ''))"
      />

      <BaseFormField
        v-if="showCity"
        :name="cityName"
        :label="cityLabel"
        :model-value="city"
        icon="i-lucide-map-pin"
        :placeholder="cityPlaceholder"
        :disabled="loading"
        @update:model-value="$emit('update:city', String($event ?? ''))"
      />

      <BaseFormField
        v-if="showArtistName"
        :name="artistFieldName"
        :label="artistLabel"
        :model-value="artistName"
        icon="i-lucide-mic-2"
        :placeholder="artistPlaceholder"
        :disabled="loading"
        @update:model-value="$emit('update:artistName', String($event ?? ''))"
      />

      <BaseFormSelect
        v-if="showPageSize"
        :name="pageSizeName"
        :label="pageSizeLabel"
        size="md"
        :items="pageSizeOptions"
        :model-value="pageSize"
        :disabled="loading"
        @update:model-value="$emit('update:pageSize', Number($event ?? 12))"
      />
    </div>

    <!-- Row 2: Dates and dropdowns -->
    <div
      v-if="secondaryFiltersCount > 0"
      class="grid grid-cols-1 items-end gap-4"
      :class="secondaryFiltersGridClass"
    >
      <BaseFormField
        v-if="showDateRange"
        :name="dateFromName"
        :label="dateFromLabel"
        type="date"
        :model-value="dateFrom"
        :disabled="loading"
        @update:model-value="$emit('update:dateFrom', String($event ?? ''))"
      />

      <BaseFormField
        v-if="showDateRange"
        :name="dateToName"
        :label="dateToLabel"
        type="date"
        :model-value="dateTo"
        :disabled="loading"
        @update:model-value="$emit('update:dateTo', String($event ?? ''))"
      />

      <BaseFormSelect
        v-if="showGenre"
        :name="genreName"
        :label="genreLabel"
        :items="genreOptions"
        :model-value="selectedGenreId"
        :disabled="loading"
        @update:model-value="selectedGenreId = String($event ?? ALL_OPTION_VALUE)"
      />

      <BaseFormSelect
        v-if="showFormat"
        :name="formatName"
        :label="formatLabel"
        :items="formatOptions"
        :model-value="selectedFormatId"
        :disabled="loading"
        @update:model-value="selectedFormatId = String($event ?? ALL_OPTION_VALUE)"
      />
    </div>
  </div>
</template>
