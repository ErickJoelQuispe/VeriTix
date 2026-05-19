<script setup lang="ts">
import type { BackofficeEventDetail, BackofficeEventPayload, BackofficeOption, CurrencyCode, GenreOption, VenueOption } from '~~/shared/types'
import { z } from 'zod'
import { normalizeEventPayload } from '@/utils/backoffice/formSafeRails'

const props = withDefaults(defineProps<{
  initialValue?: Partial<BackofficeEventDetail>
  venues: VenueOption[]
  genres: GenreOption[]
  formats: BackofficeOption[]
  submitting?: boolean
  submitLabel?: string
}>(), {
  initialValue: undefined,
  submitting: false,
  submitLabel: 'Guardar evento',
})

const emit = defineEmits<{
  submit: [payload: BackofficeEventPayload]
}>()

const dirty = defineModel<boolean>('dirty', { default: false })

const NO_FORMAT_OPTION_VALUE = '__no-format__'

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  eventDate: z.string().min(1, 'La fecha del evento es obligatoria'),
  maxCapacity: z.number().min(1, 'La capacidad debe ser al menos 1'),
  venueId: z.string().min(1, 'Selecciona un venue'),
  description: z.string().optional(),
  doorsOpenTime: z.string().optional(),
  startSale: z.string().optional(),
  endSale: z.string().optional(),
  imageUrl: z.string().optional(),
  currency: z.enum(['USD', 'EUR', 'COP']),
  formatId: z.string().optional(),
  genreIds: z.array(z.string()).optional(),
})

const state = reactive({
  name: '',
  description: '',
  eventDate: '',
  doorsOpenTime: '',
  startSale: '',
  endSale: '',
  maxCapacity: 100,
  venueId: '',
  imageUrl: '',
  currency: 'EUR' as CurrencyCode,
  formatId: '',
  genreIds: [] as string[],
})

const currencyOptions = ['EUR', 'USD', 'COP']

const venueOptions = computed(() => {
  return props.venues.map(venue => ({
    label: `${venue.name} - ${venue.city}`,
    value: venue.id,
  }))
})

const formatOptions = computed(() => {
  return [
    { label: 'Sin formato especifico', value: NO_FORMAT_OPTION_VALUE },
    ...props.formats.map(format => ({ label: format.name, value: format.id })),
  ]
})

const selectedFormatId = computed({
  get: () => state.formatId || NO_FORMAT_OPTION_VALUE,
  set: (value: string) => {
    state.formatId = value === NO_FORMAT_OPTION_VALUE ? '' : value
  },
})

const genreOptions = computed(() => {
  return props.genres.map(genre => ({ label: genre.name, value: genre.id }))
})

const initialSnapshot = ref<BackofficeEventPayload | null>(null)

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
}

function toIsoDateTime(value: string): string | undefined {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

function buildCurrentPayload(): BackofficeEventPayload {
  return normalizeEventPayload({
    name: state.name,
    description: state.description,
    eventDate: toIsoDateTime(state.eventDate) ?? '',
    doorsOpenTime: toIsoDateTime(state.doorsOpenTime),
    startSale: toIsoDateTime(state.startSale),
    endSale: toIsoDateTime(state.endSale),
    maxCapacity: Number(state.maxCapacity),
    venueId: state.venueId,
    imageUrl: state.imageUrl,
    currency: state.currency,
    formatId: state.formatId,
    genreIds: state.genreIds,
  })
}

function hasDirtyChanges() {
  const currentPayload = buildCurrentPayload()

  if (!initialSnapshot.value) {
    return false
  }

  return currentPayload.name !== initialSnapshot.value.name
    || currentPayload.description !== initialSnapshot.value.description
    || currentPayload.eventDate !== initialSnapshot.value.eventDate
    || currentPayload.doorsOpenTime !== initialSnapshot.value.doorsOpenTime
    || currentPayload.startSale !== initialSnapshot.value.startSale
    || currentPayload.endSale !== initialSnapshot.value.endSale
    || currentPayload.maxCapacity !== initialSnapshot.value.maxCapacity
    || currentPayload.venueId !== initialSnapshot.value.venueId
    || currentPayload.imageUrl !== initialSnapshot.value.imageUrl
    || currentPayload.currency !== initialSnapshot.value.currency
    || currentPayload.formatId !== initialSnapshot.value.formatId
    || (currentPayload.genreIds ?? []).join('|') !== (initialSnapshot.value.genreIds ?? []).join('|')
}

function applyInitialValue() {
  state.name = props.initialValue?.name ?? ''
  state.description = props.initialValue?.description ?? ''
  state.eventDate = toDateTimeLocalValue(props.initialValue?.eventDate)
  state.doorsOpenTime = toDateTimeLocalValue(props.initialValue?.doorsOpenTime)
  state.startSale = toDateTimeLocalValue(props.initialValue?.startSale)
  state.endSale = toDateTimeLocalValue(props.initialValue?.endSale)
  state.maxCapacity = props.initialValue?.maxCapacity ?? 100
  state.venueId = props.initialValue?.venue?.id ?? ''
  state.imageUrl = props.initialValue?.imageUrl ?? ''
  state.currency = props.initialValue?.currency ?? 'EUR'
  state.formatId = props.initialValue?.format?.id ?? ''
  state.genreIds = props.initialValue?.genres?.map(genre => genre.id) ?? []

  initialSnapshot.value = buildCurrentPayload()
  dirty.value = false
}

function handleSubmit() {
  if (props.submitting) {
    return
  }

  emit('submit', normalizeEventPayload({
    name: state.name.trim(),
    description: state.description.trim() || undefined,
    eventDate: toIsoDateTime(state.eventDate) ?? '',
    doorsOpenTime: toIsoDateTime(state.doorsOpenTime),
    startSale: toIsoDateTime(state.startSale),
    endSale: toIsoDateTime(state.endSale),
    maxCapacity: Number(state.maxCapacity),
    venueId: state.venueId,
    imageUrl: state.imageUrl.trim() || undefined,
    currency: state.currency,
    formatId: state.formatId || undefined,
    genreIds: state.genreIds.length > 0 ? state.genreIds : undefined,
  }))
}

watch(() => props.initialValue, applyInitialValue, { immediate: true })
watch(() => [
  state.name,
  state.description,
  state.eventDate,
  state.doorsOpenTime,
  state.startSale,
  state.endSale,
  state.maxCapacity,
  state.venueId,
  state.imageUrl,
  state.currency,
  state.formatId,
  state.genreIds.join('|'),
], () => {
  dirty.value = hasDirtyChanges()
})
</script>

<template>
  <FormRoot :state="state" :schema="schema" :validate-on="[]" class="space-y-8" @submit="handleSubmit">
    <div class="grid gap-5 lg:grid-cols-2">
      <FormField v-model="state.name" name="name" label="Nombre" placeholder="VeriTix Sunset Series" required />
      <FormDateTimePicker v-model="state.eventDate" name="eventDate" label="Fecha del evento" required />
    </div>

    <FormTextarea
      v-model="state.description"
      name="description"
      label="Descripcion"
      placeholder="Describe la propuesta del evento"
    />

    <div class="grid gap-5 lg:grid-cols-3">
      <FormDateTimePicker v-model="state.doorsOpenTime" name="doorsOpenTime" label="Apertura de puertas" />
      <FormDateTimePicker v-model="state.startSale" name="startSale" label="Inicio de venta" />
      <FormDateTimePicker v-model="state.endSale" name="endSale" label="Fin de venta" />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <FormField v-model="state.maxCapacity" name="maxCapacity" label="Capacidad maxima" type="number" required />
      <FormImageUpload v-model="state.imageUrl" name="imageUrl" label="Imagen" />
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <FormSelect v-model="state.currency" name="currency" label="Moneda" :items="currencyOptions.map(value => ({ label: value, value }))" required />

      <FormSelect v-model="state.venueId" name="venueId" label="Venue" :items="venueOptions" placeholder="Selecciona un venue" required />

      <FormSelect v-model="selectedFormatId" name="formatId" label="Formato" :items="formatOptions" />
    </div>

    <FormTagSelect
      v-model="state.genreIds"
      name="genreIds"
      label="Generos"
      :items="genreOptions"
      placeholder="Seleccioná generos"
    />

    <div class="flex justify-end border-t border-default/55 pt-6">
      <BaseButton variant="primary" type="submit" size="lg" :loading="submitting" :disabled="submitting" data-testid="event-form-submit">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </FormRoot>
</template>
