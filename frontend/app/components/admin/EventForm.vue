<script setup lang="ts">
import type { AdminEventDetail, AdminEventPayload, AdminOption, CurrencyCode, GenreOption, VenueOption } from '~/types'
import { z } from 'zod'
import { normalizeEventPayload } from '~/utils/admin/formSafeRails'

const props = withDefaults(defineProps<{
  initialValue?: Partial<AdminEventDetail>
  venues: VenueOption[]
  genres: GenreOption[]
  formats: AdminOption[]
  submitting?: boolean
  submitLabel?: string
}>(), {
  initialValue: undefined,
  submitting: false,
  submitLabel: 'Guardar evento',
})

const emit = defineEmits<{
  submit: [payload: AdminEventPayload]
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

const initialSnapshot = ref<AdminEventPayload | null>(null)

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

function buildCurrentPayload(): AdminEventPayload {
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

  return JSON.stringify(currentPayload) !== JSON.stringify(initialSnapshot.value)
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
watch(() => state, () => {
  dirty.value = hasDirtyChanges()
}, { deep: true })
</script>

<template>
  <UForm :state="state" :schema="schema" :validate-on="[]" class="space-y-8" @submit="handleSubmit">
    <div class="grid gap-5 lg:grid-cols-2">
      <BaseFormField v-model="state.name" name="name" label="Nombre" placeholder="VeriTix Sunset Series" required />
      <BaseFormField v-model="state.eventDate" name="eventDate" label="Fecha del evento" type="datetime-local" required />
    </div>

    <UFormField name="description" label="Descripcion" class="w-full">
      <BaseFormTextarea
        v-model="state.description"
        placeholder="Describe la propuesta del evento"
      />
    </UFormField>

    <div class="grid gap-5 lg:grid-cols-3">
      <BaseFormField v-model="state.doorsOpenTime" name="doorsOpenTime" label="Apertura de puertas" type="datetime-local" />
      <BaseFormField v-model="state.startSale" name="startSale" label="Inicio de venta" type="datetime-local" />
      <BaseFormField v-model="state.endSale" name="endSale" label="Fin de venta" type="datetime-local" />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <BaseFormField v-model="state.maxCapacity" name="maxCapacity" label="Capacidad maxima" type="number" required />
      <BaseFormField v-model="state.imageUrl" name="imageUrl" label="Imagen" type="url" placeholder="https://..." />
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <UFormField name="currency" label="Moneda" required>
        <USelect v-model="state.currency" :items="currencyOptions" variant="subtle" size="lg" class="w-full" />
      </UFormField>

      <UFormField name="venueId" label="Venue" required>
        <USelect v-model="state.venueId" :items="venueOptions" placeholder="Selecciona un venue" variant="subtle" size="lg" class="w-full" />
      </UFormField>

      <UFormField name="formatId" label="Formato">
        <USelect v-model="selectedFormatId" :items="formatOptions" variant="subtle" size="lg" class="w-full" />
      </UFormField>
    </div>

    <UFormField name="genreIds" label="Generos" class="w-full">
      <USelect
        v-model="state.genreIds"
        class="w-full"
        :items="genreOptions"
        variant="subtle"
        size="lg"
        multiple
        placeholder="Selecciona generos"
      />
    </UFormField>

    <div class="flex justify-end border-t border-default/55 pt-6">
      <BaseButton kind="primary" type="submit" size="lg" :loading="submitting" :disabled="submitting" data-testid="event-form-submit">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </UForm>
</template>
