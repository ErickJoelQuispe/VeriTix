<script setup lang="ts">
import type {
  AdminArtistPayload,
  AdminArtistRecord,
  GenreOption,
} from '~/types'
import { z } from 'zod'
import { normalizeArtistPayload } from '~/utils/admin/formSafeRails'

const props = withDefaults(defineProps<{
  initialValue?: Partial<AdminArtistRecord>
  genres: GenreOption[]
  submitting?: boolean
  submitLabel?: string
}>(), {
  initialValue: undefined,
  submitting: false,
  submitLabel: 'Guardar artista',
})

const emit = defineEmits<{
  submit: [payload: AdminArtistPayload]
}>()

const dirty = defineModel<boolean>('dirty', { default: false })

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string()
    .min(1, 'El slug es obligatorio')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones'),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  country: z.string().optional(),
  website: z.string().optional(),
  genreIds: z.array(z.string()).optional(),
})

const state = reactive({
  name: '',
  slug: '',
  bio: '',
  imageUrl: '',
  country: '',
  website: '',
  genreIds: [] as string[],
})

const genreOptions = computed(() => {
  return props.genres.map(genre => ({
    label: genre.name,
    value: genre.id,
  }))
})

const initialSnapshot = ref<AdminArtistPayload | null>(null)

function buildCurrentPayload(): AdminArtistPayload {
  return normalizeArtistPayload({
    name: state.name,
    slug: state.slug,
    bio: state.bio,
    imageUrl: state.imageUrl,
    country: state.country,
    website: state.website,
    genreIds: state.genreIds,
    isActive: props.initialValue?.isActive,
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
  state.slug = props.initialValue?.slug ?? ''
  state.bio = props.initialValue?.bio ?? ''
  state.imageUrl = props.initialValue?.imageUrl ?? ''
  state.country = props.initialValue?.country ?? ''
  state.website = props.initialValue?.website ?? ''
  state.genreIds = props.initialValue?.genres?.map(genre => genre.id) ?? []

  initialSnapshot.value = buildCurrentPayload()
  dirty.value = false
}

function handleSubmit() {
  if (props.submitting) {
    return
  }

  emit('submit', normalizeArtistPayload({
    name: state.name.trim(),
    slug: state.slug.trim(),
    bio: state.bio.trim() || undefined,
    imageUrl: state.imageUrl.trim() || undefined,
    country: state.country.trim() || undefined,
    website: state.website.trim() || undefined,
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
      <BaseFormField v-model="state.name" name="name" label="Nombre" required />
      <BaseFormField
        v-model="state.slug"
        name="slug"
        label="Slug"
        placeholder="los-planetas"
        required
      />
    </div>

    <UFormField name="bio" label="Biografía">
      <BaseFormTextarea v-model="state.bio" placeholder="Describí al artista" />
    </UFormField>

    <div class="grid gap-5 lg:grid-cols-3">
      <BaseFormField
        v-model="state.imageUrl"
        name="imageUrl"
        label="Imagen"
        type="url"
        placeholder="https://..."
      />
      <BaseFormField
        v-model="state.country"
        name="country"
        label="País"
        placeholder="ES"
      />
      <BaseFormField
        v-model="state.website"
        name="website"
        label="Web"
        type="url"
        placeholder="https://..."
      />
    </div>

    <UFormField name="genreIds" label="Géneros">
      <USelect
        v-model="state.genreIds"
        :items="genreOptions"
        multiple
        placeholder="Seleccioná géneros"
      />
    </UFormField>

    <div class="flex justify-end">
      <BaseButton kind="primary" type="submit" size="lg" :loading="submitting" :disabled="submitting">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </UForm>
</template>
