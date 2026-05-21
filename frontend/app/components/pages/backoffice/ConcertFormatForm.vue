<script setup lang="ts">
import type { BackofficeConcertFormatPayload, BackofficeFormatRecord } from '~~/shared/types'
import { z } from 'zod'
import { normalizeConcertFormatPayload } from '@/utils/backoffice/formSafeRails'

const props = withDefaults(defineProps<{
  initialValue?: Partial<BackofficeFormatRecord>
  submitting?: boolean
  submitLabel?: string
}>(), {
  initialValue: undefined,
  submitting: false,
  submitLabel: 'Guardar formato',
})

const emit = defineEmits<{
  submit: [payload: BackofficeConcertFormatPayload]
}>()

const dirty = defineModel<boolean>('dirty', { default: false })

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string()
    .min(1, 'El slug es obligatorio')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones'),
  description: z.string().optional(),
  icon: z.string().optional(),
})

const state = reactive({
  name: '',
  slug: '',
  description: '',
  icon: '',
})

const initialSnapshot = ref<BackofficeConcertFormatPayload | null>(null)

function buildCurrentPayload(): BackofficeConcertFormatPayload {
  return normalizeConcertFormatPayload({
    name: state.name,
    slug: state.slug,
    description: state.description,
    icon: state.icon,
  })
}

function hasDirtyChanges() {
  const currentPayload = buildCurrentPayload()

  if (!initialSnapshot.value) {
    return false
  }

  return currentPayload.name !== initialSnapshot.value.name
    || currentPayload.slug !== initialSnapshot.value.slug
    || currentPayload.description !== initialSnapshot.value.description
    || currentPayload.icon !== initialSnapshot.value.icon
}

function applyInitialValue() {
  state.name = props.initialValue?.name ?? ''
  state.slug = props.initialValue?.slug ?? ''
  state.description = props.initialValue?.description ?? ''
  state.icon = props.initialValue?.icon ?? ''

  initialSnapshot.value = buildCurrentPayload()
  dirty.value = false
}

function handleSubmit() {
  if (props.submitting) {
    return
  }

  emit('submit', normalizeConcertFormatPayload({
    name: state.name.trim(),
    slug: state.slug.trim(),
    description: state.description.trim() || undefined,
    icon: state.icon.trim() || undefined,
  }))
}

watch(() => props.initialValue, applyInitialValue, { immediate: true })
watch(() => [state.name, state.slug, state.description, state.icon], () => {
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
        placeholder="concierto"
        required
      />
    </div>

    <FormTextarea v-model="state.description" name="description" label="Descripción" placeholder="Describe el formato" />

    <FormField
      v-model="state.icon"
      name="icon"
      label="Ícono"
      placeholder="i-lucide-ticket"
    />

    <div class="flex justify-end border-t border-default/55 pt-6">
      <BaseButton variant="primary" type="submit" size="lg" :loading="submitting" :disabled="submitting">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </FormRoot>
</template>
