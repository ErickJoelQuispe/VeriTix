<script setup lang="ts">
import type {
  BackofficeFilterControl,
  BackofficeFilterFieldControl,
  BackofficeFilterOption,
  BackofficeFilterSelectControl,
  BackofficeFilterVisibility,
} from '~~/shared/types'
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
  role?: string
  roleLabel?: string
  roleAllLabel?: string
  roleName?: string
  roleIcon?: string
  pageSize?: number
  pageSizeOptions?: Array<{ label: string, value: string | number }>
  pageSizeLabel?: string
  pageSizeName?: string
  genreId?: string
  genreLabel?: string
  genreAllLabel?: string
  genreName?: string
  status?: string
  statusIcon?: string
  formatId?: string
  formatLabel?: string
  formatAllLabel?: string
  formatName?: string
  roles?: Array<{ id: string, name: string }>
  statusLabel?: string
  statusAllLabel?: string
  statusName?: string
  statuses?: Array<{ id: string, name: string }>
  dateFrom?: string
  dateFromLabel?: string
  dateFromName?: string
  dateTo?: string
  dateToLabel?: string
  dateToName?: string
  genres?: Array<{ id: string, name: string }>
  formats?: Array<{ id: string, name: string }>
  loading?: boolean
  visibleFilters?: BackofficeFilterVisibility[]
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
  role: '',
  roleLabel: 'Rol',
  roleAllLabel: 'Todos los roles',
  roleName: 'role',
  roleIcon: 'i-lucide-shield-check',
  pageSize: 12,
  pageSizeOptions: () => [],
  pageSizeLabel: 'Por página',
  pageSizeName: 'pageSize',
  genreId: '',
  genreLabel: 'Género',
  genreAllLabel: 'Todos los géneros',
  genreName: 'genreId',
  status: '',
  statusIcon: 'i-lucide-badge-check',
  formatId: '',
  formatLabel: 'Formato',
  formatAllLabel: 'Todos los formatos',
  formatName: 'formatId',
  roles: () => [],
  statusLabel: 'Estado',
  statusAllLabel: 'Todos los estados',
  statusName: 'status',
  statuses: () => [],
  dateFrom: '',
  dateFromLabel: 'Desde',
  dateFromName: 'dateFrom',
  dateTo: '',
  dateToLabel: 'Hasta',
  dateToName: 'dateTo',
  genres: () => [],
  formats: () => [],
  loading: false,
  visibleFilters: () => ['city', 'artistName', 'pageSize', 'genre', 'format', 'role', 'status', 'dateRange'],
})

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:city', value: string): void
  (e: 'update:artistName', value: string): void
  (e: 'update:role', value: string): void
  (e: 'update:pageSize', value: number): void
  (e: 'update:genreId', value: string): void
  (e: 'update:formatId', value: string): void
  (e: 'update:status', value: string): void
  (e: 'update:dateFrom', value: string): void
  (e: 'update:dateTo', value: string): void
}>()

const ALL_OPTION_VALUE = '__all__'

function buildGridClass(controlCount: number) {
  if (controlCount >= 3) {
    return 'md:grid-cols-3'
  }

  if (controlCount === 2) {
    return 'md:grid-cols-2'
  }

  return 'md:grid-cols-1'
}

function createFieldControl(control: Omit<BackofficeFilterFieldControl, 'kind'>): BackofficeFilterFieldControl {
  return {
    kind: 'field',
    ...control,
  }
}

function createSelectControl(control: Omit<BackofficeFilterSelectControl, 'kind'>): BackofficeFilterSelectControl {
  return {
    kind: 'select',
    ...control,
  }
}

const genreOptions = computed<BackofficeFilterOption[]>(() => {
  return [
    { label: props.genreAllLabel, value: ALL_OPTION_VALUE },
    ...props.genres.map(g => ({ label: g.name, value: g.id })),
  ]
})

const formatOptions = computed<BackofficeFilterOption[]>(() => {
  return [
    { label: props.formatAllLabel, value: ALL_OPTION_VALUE },
    ...props.formats.map(f => ({ label: f.name, value: f.id })),
  ]
})

const roleOptions = computed<BackofficeFilterOption[]>(() => {
  const items = props.roles.length > 0 ? props.roles : props.genres

  return [
    { label: props.roleAllLabel, value: ALL_OPTION_VALUE },
    ...items.map(role => ({ label: role.name, value: role.id })),
  ]
})

const statusOptions = computed<BackofficeFilterOption[]>(() => {
  const items = props.statuses.length > 0 ? props.statuses : props.formats

  return [
    { label: props.statusAllLabel, value: ALL_OPTION_VALUE },
    ...items.map(status => ({ label: status.name, value: status.id })),
  ]
})

const primaryControls = computed<BackofficeFilterControl[]>(() => {
  const controls: BackofficeFilterControl[] = [
    createFieldControl({
      key: 'search',
      name: props.searchName,
      label: props.searchLabel,
      modelValue: props.search,
      placeholder: props.searchPlaceholder,
      icon: props.searchIcon,
      disabled: props.loading,
      onUpdate: value => emit('update:search', value),
    }),
  ]

  if (props.visibleFilters.includes('city')) {
    controls.push(createFieldControl({
      key: 'city',
      name: props.cityName,
      label: props.cityLabel,
      modelValue: props.city,
      placeholder: props.cityPlaceholder,
      icon: 'i-lucide-map-pin',
      disabled: props.loading,
      onUpdate: value => emit('update:city', value),
    }))
  }

  if (props.visibleFilters.includes('artistName')) {
    controls.push(createFieldControl({
      key: 'artistName',
      name: props.artistFieldName,
      label: props.artistLabel,
      modelValue: props.artistName,
      placeholder: props.artistPlaceholder,
      icon: 'i-lucide-user-round-search',
      disabled: props.loading,
      onUpdate: value => emit('update:artistName', value),
    }))
  }

  if (props.visibleFilters.includes('role')) {
    controls.push(createSelectControl({
      key: 'role',
      name: props.roleName,
      label: props.roleLabel,
      modelValue: props.role || ALL_OPTION_VALUE,
      items: roleOptions.value,
      icon: props.roleIcon,
      placeholderValue: ALL_OPTION_VALUE,
      disabled: props.loading,
      onUpdate: value => emit('update:role', value === ALL_OPTION_VALUE ? '' : String(value)),
    }))
  }

  return controls
})

const secondaryControls = computed<BackofficeFilterControl[]>(() => {
  const controls: BackofficeFilterControl[] = []

  if (props.visibleFilters.includes('dateRange')) {
    controls.push(
      createFieldControl({
        key: 'dateFrom',
        name: props.dateFromName,
        label: props.dateFromLabel,
        modelValue: props.dateFrom,
        type: 'date',
        disabled: props.loading,
        onUpdate: value => emit('update:dateFrom', value),
      }),
      createFieldControl({
        key: 'dateTo',
        name: props.dateToName,
        label: props.dateToLabel,
        modelValue: props.dateTo,
        type: 'date',
        disabled: props.loading,
        onUpdate: value => emit('update:dateTo', value),
      }),
    )
  }

  if (props.visibleFilters.includes('pageSize')) {
    controls.push(createSelectControl({
      key: 'pageSize',
      name: props.pageSizeName,
      label: props.pageSizeLabel,
      modelValue: props.pageSize,
      items: props.pageSizeOptions,
      icon: 'i-lucide-list-filter',
      size: 'md',
      disabled: props.loading,
      onUpdate: value => emit('update:pageSize', Number(value ?? 12)),
    }))
  }

  if (props.visibleFilters.includes('genre')) {
    controls.push(createSelectControl({
      key: 'genreId',
      name: props.genreName,
      label: props.genreLabel,
      modelValue: props.genreId || ALL_OPTION_VALUE,
      items: genreOptions.value,
      icon: 'i-lucide-music-2',
      placeholderValue: ALL_OPTION_VALUE,
      disabled: props.loading,
      onUpdate: value => emit('update:genreId', value === ALL_OPTION_VALUE ? '' : String(value)),
    }))
  }

  if (props.visibleFilters.includes('format')) {
    controls.push(createSelectControl({
      key: 'formatId',
      name: props.formatName,
      label: props.formatLabel,
      modelValue: props.formatId || ALL_OPTION_VALUE,
      items: formatOptions.value,
      icon: 'i-lucide-ticket',
      placeholderValue: ALL_OPTION_VALUE,
      disabled: props.loading,
      onUpdate: value => emit('update:formatId', value === ALL_OPTION_VALUE ? '' : String(value)),
    }))
  }

  if (props.visibleFilters.includes('status')) {
    controls.push(createSelectControl({
      key: 'status',
      name: props.statusName,
      label: props.statusLabel,
      modelValue: props.status || ALL_OPTION_VALUE,
      items: statusOptions.value,
      icon: props.statusIcon,
      placeholderValue: ALL_OPTION_VALUE,
      disabled: props.loading,
      onUpdate: value => emit('update:status', value === ALL_OPTION_VALUE ? '' : String(value)),
    }))
  }

  return controls
})

const primaryGridClass = computed(() => buildGridClass(primaryControls.value.length))
const secondaryGridClass = computed(() => buildGridClass(secondaryControls.value.length))
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <!-- Primary controls -->
    <div class="grid grid-cols-1 items-end gap-4" :class="primaryGridClass">
      <template v-for="item in primaryControls" :key="item.key">
        <FormDatePicker
          v-if="item.kind === 'field' && item.type === 'date'"
          :name="item.name"
          :label="item.label"
          :model-value="item.modelValue"
          :disabled="item.disabled"
          size="md"
          :placeholder="item.placeholder || 'Seleccioná una fecha'"
          @update:model-value="item.onUpdate(String($event ?? ''))"
        />
        <FormInput
          v-else-if="item.kind === 'field'"
          :name="item.name"
          :label="item.label"
          :model-value="item.modelValue"
          :placeholder="item.placeholder"
          :icon="item.icon"
          :type="item.type"
          :disabled="item.disabled"
          size="md"
          @update:model-value="item.onUpdate(String($event ?? ''))"
        />
        <FormSelect
          v-else
          :name="item.name"
          :label="item.label"
          :items="item.items"
          :model-value="String(item.modelValue ?? '')"
          :icon="item.icon"
          :placeholder-value="item.placeholderValue"
          size="md"
          :disabled="item.disabled"
          @update:model-value="item.onUpdate(String($event ?? ''))"
        />
      </template>
    </div>

    <!-- Secondary controls -->
    <div v-if="secondaryControls.length > 0" class="grid grid-cols-1 items-end gap-4" :class="secondaryGridClass">
      <template v-for="item in secondaryControls" :key="item.key">
        <FormDatePicker
          v-if="item.kind === 'field' && item.type === 'date'"
          :name="item.name"
          :label="item.label"
          :model-value="item.modelValue"
          :disabled="item.disabled"
          size="md"
          :placeholder="item.placeholder || 'Seleccioná una fecha'"
          @update:model-value="item.onUpdate(String($event ?? ''))"
        />
        <FormInput
          v-else-if="item.kind === 'field'"
          :name="item.name"
          :label="item.label"
          :model-value="item.modelValue"
          :placeholder="item.placeholder"
          :icon="item.icon"
          :type="item.type"
          :disabled="item.disabled"
          size="md"
          @update:model-value="item.onUpdate(String($event ?? ''))"
        />
        <FormSelect
          v-else
          :name="item.name"
          :label="item.label"
          :items="item.items"
          :model-value="String(item.modelValue ?? '')"
          :icon="item.icon"
          :placeholder-value="item.placeholderValue"
          size="md"
          :disabled="item.disabled"
          @update:model-value="item.onUpdate(String($event ?? ''))"
        />
      </template>
    </div>
  </div>
</template>
