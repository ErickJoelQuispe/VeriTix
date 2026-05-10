<script setup lang="ts">
import type { BackofficeCreateUserPayload, BackofficeUpdateUserPayload, BackofficeUserRecord, UserRole } from '~~/shared/types'
import { z } from 'zod'
import { normalizeCreateUserPayload, normalizeUpdateUserPayload } from '@/utils/backoffice/formSafeRails'

interface RoleOption {
  value: UserRole
  label: string
}

const props = withDefaults(defineProps<{
  initialValue?: Partial<BackofficeUserRecord>
  roleOptions: RoleOption[]
  submitting?: boolean
  submitLabel?: string
  includePassword?: boolean
}>(), {
  initialValue: undefined,
  submitting: false,
  submitLabel: 'Guardar usuario',
  includePassword: true,
})

const emit = defineEmits<{
  submit: [payload: BackofficeCreateUserPayload | BackofficeUpdateUserPayload]
  emailBlur: [email: string]
}>()

const dirty = defineModel<boolean>('dirty', { default: false })

const phonePattern = /^\+[1-9]\d{7,14}$/

const createSchema = z.object({
  email: z.string().email('Ingresá un correo válido'),
  phone: z.string().regex(phonePattern, 'Usá formato internacional (ej: +34958123456)'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Incluí mayúscula, minúscula y número'),
  role: z.enum(['BUYER', 'CREATOR', 'VALIDATOR', 'ADMIN']),
})

const editSchema = z.object({
  email: z.string().email('Ingresá un correo válido'),
  phone: z.string().regex(phonePattern, 'Usá formato internacional (ej: +34958123456)'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  role: z.enum(['BUYER', 'CREATOR', 'VALIDATOR', 'ADMIN']),
  avatarUrl: z.string().optional(),
  isActive: z.boolean(),
  emailVerified: z.boolean(),
})

const formSchema = computed(() => {
  return props.includePassword ? createSchema : editSchema
})

const state = reactive({
  email: '',
  phone: '',
  name: '',
  lastName: '',
  password: '',
  role: 'BUYER' as UserRole,
  avatarUrl: '',
  isActive: true,
  emailVerified: false,
})

const statusOptions = [
  { label: 'Activo', value: 'true' },
  { label: 'Inactivo', value: 'false' },
]

const verificationOptions = [
  { label: 'Verificado', value: 'true' },
  { label: 'Pendiente', value: 'false' },
]

const activeValue = computed({
  get: () => (state.isActive ? 'true' : 'false'),
  set: (value: string | number | undefined) => {
    state.isActive = value === 'true'
  },
})

const verificationValue = computed({
  get: () => (state.emailVerified ? 'true' : 'false'),
  set: (value: string | number | undefined) => {
    state.emailVerified = value === 'true'
  },
})

const initialSnapshot = ref<BackofficeCreateUserPayload | BackofficeUpdateUserPayload | null>(null)

function buildCurrentPayload(): BackofficeCreateUserPayload | BackofficeUpdateUserPayload {
  if (props.includePassword) {
    return normalizeCreateUserPayload({
      email: state.email,
      phone: state.phone,
      name: state.name,
      lastName: state.lastName,
      password: state.password,
      role: state.role,
    })
  }

  return normalizeUpdateUserPayload({
    email: state.email,
    phone: state.phone,
    name: state.name,
    lastName: state.lastName,
    role: state.role,
    avatarUrl: state.avatarUrl,
    isActive: state.isActive,
    emailVerified: state.emailVerified,
  })
}

function hasDirtyChanges() {
  const currentPayload = buildCurrentPayload()

  if (!initialSnapshot.value) {
    return false
  }

  if (props.includePassword) {
    const initial = initialSnapshot.value as BackofficeCreateUserPayload
    const current = currentPayload as BackofficeCreateUserPayload

    return current.email !== initial.email
      || current.phone !== initial.phone
      || current.name !== initial.name
      || current.lastName !== initial.lastName
      || current.password !== initial.password
      || current.role !== initial.role
  }

  const initial = initialSnapshot.value as BackofficeUpdateUserPayload
  const current = currentPayload as BackofficeUpdateUserPayload

  return current.email !== initial.email
    || current.phone !== initial.phone
    || current.name !== initial.name
    || current.lastName !== initial.lastName
    || current.role !== initial.role
    || current.avatarUrl !== initial.avatarUrl
    || current.isActive !== initial.isActive
    || current.emailVerified !== initial.emailVerified
}

function applyInitialValue() {
  state.email = props.initialValue?.email ?? ''
  state.phone = props.initialValue?.phone ?? ''
  state.name = props.initialValue?.name ?? ''
  state.lastName = props.initialValue?.lastName ?? ''
  state.password = ''
  state.role = props.initialValue?.role ?? 'BUYER'
  state.avatarUrl = props.initialValue?.avatarUrl ?? ''
  state.isActive = props.initialValue?.isActive ?? true
  state.emailVerified = props.initialValue?.emailVerified ?? false

  initialSnapshot.value = buildCurrentPayload()
  dirty.value = false
}

function handleEmailBlur() {
  emit('emailBlur', state.email.trim())
}

function handleSubmit() {
  if (props.submitting) {
    return
  }

  if (props.includePassword) {
    emit('submit', normalizeCreateUserPayload({
      email: state.email.trim(),
      phone: state.phone.trim(),
      name: state.name.trim(),
      lastName: state.lastName.trim(),
      password: state.password,
      role: state.role,
    }))

    return
  }

  emit('submit', normalizeUpdateUserPayload({
    email: state.email.trim(),
    phone: state.phone.trim(),
    name: state.name.trim(),
    lastName: state.lastName.trim(),
    role: state.role,
    avatarUrl: state.avatarUrl.trim() || undefined,
    isActive: state.isActive,
    emailVerified: state.emailVerified,
  }))
}

watch(() => props.initialValue, applyInitialValue, { immediate: true })
watch(() => [
  state.email,
  state.phone,
  state.name,
  state.lastName,
  state.password,
  state.role,
  state.avatarUrl,
  state.isActive,
  state.emailVerified,
  props.includePassword,
], () => {
  dirty.value = hasDirtyChanges()
})
</script>

<template>
  <FormRoot :state="state" :schema="formSchema" :validate-on="[]" class="space-y-8" @submit="handleSubmit">
    <div class="grid gap-5 lg:grid-cols-2">
      <FormField v-model="state.name" name="name" label="Nombre" required />
      <FormField v-model="state.lastName" name="lastName" label="Apellido" required />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <FormField v-model="state.email" name="email" label="Correo" type="email" required @blur="handleEmailBlur" />
      <FormField
        v-model="state.phone"
        name="phone"
        label="Teléfono"
        placeholder="+34958123456"
        required
      />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <FormSelect
        v-model="state.role"
        name="role"
        label="Rol"
        :items="roleOptions"
      />

      <FormField
        v-if="!includePassword"
        v-model="state.avatarUrl"
        name="avatarUrl"
        label="Avatar"
        type="url"
        placeholder="https://..."
      />

      <FormField
        v-else
        v-model="state.password"
        name="password"
        label="Contraseña"
        type="password"
        required
      />
    </div>

    <div v-if="!includePassword" class="grid gap-5 lg:grid-cols-2">
      <FormSelect
        v-model="activeValue"
        name="isActive"
        label="Estado"
        :items="statusOptions"
      />

      <FormSelect
        v-model="verificationValue"
        name="emailVerified"
        label="Verificación"
        :items="verificationOptions"
      />
    </div>

    <div class="flex justify-end">
      <BaseButton variant="primary" type="submit" size="lg" :loading="submitting" :disabled="submitting">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </FormRoot>
</template>
