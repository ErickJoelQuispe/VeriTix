<script setup lang="ts">
import type {
  BackofficeVenuePayload,
  BackofficeVenueRecord,
  VenueType,
} from '~~/shared/types'
import { z } from 'zod'
import { VENUE_TYPE_LABELS } from '~~/shared/types'
import { normalizeVenuePayload } from '@/utils/backoffice/formSafeRails'

const props = withDefaults(defineProps<{
  initialValue?: Partial<BackofficeVenueRecord>
  submitting?: boolean
  submitLabel?: string
}>(), {
  initialValue: undefined,
  submitting: false,
  submitLabel: 'Guardar recinto',
})

const emit = defineEmits<{
  submit: [payload: BackofficeVenuePayload]
}>()

const dirty = defineModel<boolean>('dirty', { default: false })

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string()
    .min(1, 'El slug es obligatorio')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones'),
  address: z.string().min(1, 'La dirección es obligatoria'),
  city: z.string().min(1, 'La ciudad es obligatoria'),
  state: z.string().optional(),
  country: z.string().optional(),
  capacity: z.number().min(1, 'La capacidad debe ser al menos 1').optional().nullable(),
  type: z.string().optional(),
  imageUrl: z.string().optional(),
  website: z.string().optional(),
})

const state = reactive({
  name: '',
  slug: '',
  address: '',
  city: '',
  state: '',
  country: 'ES',
  capacity: '',
  type: 'FORO' as string,
  imageUrl: '',
  website: '',
})

const venueTypeOptions = computed(() => {
  return (Object.entries(VENUE_TYPE_LABELS) as [VenueType, string][]).map(([value, label]) => ({
    label,
    value,
  }))
})

const initialSnapshot = ref<BackofficeVenuePayload | null>(null)

function parseCapacity(): number | null | undefined {
  if (state.capacity === '' || state.capacity == null) {
    return null
  }

  const parsed = Number(state.capacity)

  return Number.isNaN(parsed) ? null : parsed
}

function buildCurrentPayload(): BackofficeVenuePayload {
  return normalizeVenuePayload({
    name: state.name,
    slug: state.slug,
    address: state.address,
    city: state.city,
    state: state.state || undefined,
    country: state.country || undefined,
    capacity: parseCapacity(),
    type: state.type as VenueType,
    isActive: props.initialValue?.isActive,
    imageUrl: state.imageUrl || undefined,
    website: state.website || undefined,
  })
}

function hasDirtyChanges() {
  const currentPayload = buildCurrentPayload()

  if (!initialSnapshot.value) {
    return false
  }

  return currentPayload.name !== initialSnapshot.value.name
    || currentPayload.slug !== initialSnapshot.value.slug
    || currentPayload.address !== initialSnapshot.value.address
    || currentPayload.city !== initialSnapshot.value.city
    || currentPayload.state !== initialSnapshot.value.state
    || currentPayload.country !== initialSnapshot.value.country
    || String(currentPayload.capacity ?? '') !== String(initialSnapshot.value.capacity ?? '')
    || currentPayload.type !== initialSnapshot.value.type
    || currentPayload.imageUrl !== initialSnapshot.value.imageUrl
    || currentPayload.website !== initialSnapshot.value.website
}

function applyInitialValue() {
  state.name = props.initialValue?.name ?? ''
  state.slug = props.initialValue?.slug ?? ''
  state.address = props.initialValue?.address ?? ''
  state.city = props.initialValue?.city ?? ''
  state.state = props.initialValue?.state ?? ''
  state.country = props.initialValue?.country ?? 'ES'
  state.capacity = props.initialValue?.capacity != null ? String(props.initialValue.capacity) : ''
  state.type = props.initialValue?.type ?? 'FORO'
  state.imageUrl = props.initialValue?.imageUrl ?? ''
  state.website = props.initialValue?.website ?? ''

  initialSnapshot.value = buildCurrentPayload()
  dirty.value = false
}

function handleSubmit() {
  if (props.submitting) {
    return
  }

  emit('submit', normalizeVenuePayload({
    name: state.name.trim(),
    slug: state.slug.trim(),
    address: state.address.trim(),
    city: state.city.trim(),
    state: state.state.trim() || undefined,
    country: state.country.trim() || 'ES',
    capacity: parseCapacity(),
    type: state.type as VenueType,
    imageUrl: state.imageUrl.trim() || undefined,
    website: state.website.trim() || undefined,
  }))
}

watch(() => props.initialValue, applyInitialValue, { immediate: true })
watch(() => [
  state.name,
  state.slug,
  state.address,
  state.city,
  state.state,
  state.country,
  state.capacity,
  state.type,
  state.imageUrl,
  state.website,
], () => {
  dirty.value = hasDirtyChanges()
})
</script>

<template>
  <FormRoot :state="state" :schema="schema" :validate-on="[]" class="space-y-8" @submit="handleSubmit">
    <div class="grid gap-5 lg:grid-cols-2">
      <FormField v-model="state.name" name="name" label="Nombre" required />
      <FormField
        v-model="state.slug"
        name="slug"
        label="Slug"
        placeholder="palacio-congresos-granada"
        required
      />
    </div>

    <FormField
      v-model="state.address"
      name="address"
      label="Dirección"
      placeholder="Calle, número, etc."
      required
    />

    <div class="grid gap-5 lg:grid-cols-3">
      <FormField
        v-model="state.city"
        name="city"
        label="Ciudad"
        required
      />
      <FormField
        v-model="state.state"
        name="state"
        label="Provincia / Estado"
        placeholder="Andalucía"
      />
      <FormField
        v-model="state.country"
        name="country"
        label="País (ISO 3166-1 alpha-2)"
        placeholder="ES"
      />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <FormField
        v-model="state.capacity"
        name="capacity"
        label="Capacidad"
        type="number"
        placeholder="Ej: 2000"
      />
      <FormSelect
        v-model="state.type"
        name="type"
        label="Tipo de recinto"
        :items="venueTypeOptions"
      />
    </div>

    <div class="border-t border-default/55 pt-6">
      <FormImageUpload v-model="state.imageUrl" name="imageUrl" label="Imagen" folder="venues" />
    </div>

    <FormField
      v-model="state.website"
      name="website"
      label="Sitio web"
      type="url"
      placeholder="https://..."
    />

    <div class="flex justify-end border-t border-default/55 pt-6">
      <BaseButton variant="primary" type="submit" size="lg" :loading="submitting" :disabled="submitting">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </FormRoot>
</template>
