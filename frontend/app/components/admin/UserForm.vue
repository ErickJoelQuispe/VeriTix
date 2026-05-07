<script setup lang="ts">
import type { UserRole } from '~~/shared/types'
import type {
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
  AdminUserRecord,
} from '~/types'
import { z } from 'zod'
import { normalizeCreateUserPayload, normalizeUpdateUserPayload } from '~/utils/admin/formSafeRails'

interface RoleOption {
  value: UserRole
  label: string
}

const props = withDefaults(defineProps<{
  initialValue?: Partial<AdminUserRecord>
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
  submit: [payload: AdminCreateUserPayload | AdminUpdateUserPayload]
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

const initialSnapshot = ref<AdminCreateUserPayload | AdminUpdateUserPayload | null>(null)

function buildCurrentPayload(): AdminCreateUserPayload | AdminUpdateUserPayload {
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

  return JSON.stringify(currentPayload) !== JSON.stringify(initialSnapshot.value)
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
watch(() => state, () => {
  dirty.value = hasDirtyChanges()
}, { deep: true })
</script>

<template>
  <UForm :state="state" :schema="formSchema" :validate-on="[]" class="space-y-8" @submit="handleSubmit">
    <div class="grid gap-5 lg:grid-cols-2">
      <BaseFormField v-model="state.name" name="name" label="Nombre" required />
      <BaseFormField v-model="state.lastName" name="lastName" label="Apellido" required />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <BaseFormField v-model="state.email" name="email" label="Correo" type="email" required @blur="handleEmailBlur" />
      <BaseFormField
        v-model="state.phone"
        name="phone"
        label="Teléfono"
        placeholder="+34958123456"
        required
      />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <BaseFormSelect
        v-model="state.role"
        name="role"
        label="Rol"
        :items="roleOptions"
      />

      <BaseFormField
        v-if="!includePassword"
        v-model="state.avatarUrl"
        name="avatarUrl"
        label="Avatar"
        type="url"
        placeholder="https://..."
      />

      <BaseFormField
        v-else
        v-model="state.password"
        name="password"
        label="Contraseña"
        type="password"
        required
      />
    </div>

    <div v-if="!includePassword" class="grid gap-5 lg:grid-cols-2">
      <BaseFormSelect
        v-model="activeValue"
        name="isActive"
        label="Estado"
        :items="statusOptions"
      />

      <BaseFormSelect
        v-model="verificationValue"
        name="emailVerified"
        label="Verificación"
        :items="verificationOptions"
      />
    </div>

    <div class="flex justify-end">
      <BaseButton kind="primary" type="submit" size="lg" :loading="submitting" :disabled="submitting">
        {{ submitLabel }}
      </BaseButton>
    </div>
  </UForm>
</template>
