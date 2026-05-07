<script setup lang="ts">
import type {
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
} from '~/types'
import { useAdminUsersRepository } from '~/repositories/adminUsersRepository'
import { normalizeCreateUserPayload } from '~/utils/admin/formSafeRails'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Nuevo usuario | Admin VeriTix' })

const { createUser: createAdminUser, isEmailTaken } = useAdminUsersRepository()
const { roleOptions } = useAdminApi()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifySuccess } = useAppNotifications()

const submitting = ref(false)
const isFormDirty = ref(false)
const totalRoles = computed(() => roleOptions.length)

useUnsavedChangesGuard({
  isDirty: isFormDirty,
  isSubmitting: submitting,
})

function resolveUserConflictMessage(error: unknown) {
  const status = getApiErrorStatus(error)

  if (status !== 409) {
    return ''
  }

  const normalizedMessage = getApiErrorMessage(error, '').toLowerCase()

  if (normalizedMessage.includes('phone') || normalizedMessage.includes('tel')) {
    return 'Ya existe un usuario con ese teléfono.'
  }

  if (normalizedMessage.includes('email') || normalizedMessage.includes('correo')) {
    return 'Ya existe un usuario con ese correo.'
  }

  return 'Ya existe un usuario con el mismo correo o teléfono.'
}

async function validateEmailAvailability(email: string) {
  const normalizedEmail = email.trim()

  if (!normalizedEmail) {
    return true
  }

  const emailExists = await isEmailTaken(normalizedEmail)

  if (emailExists) {
    notifyError('Ya existe un usuario con ese correo.', { id: 'admin-users-email-conflict' })
    return false
  }

  return true
}

async function handleEmailBlur(email: string) {
  if (submitting.value) {
    return
  }

  try {
    await validateEmailAvailability(email)
  }
  catch {
  }
}

async function createUser(payload: AdminCreateUserPayload | AdminUpdateUserPayload) {
  if (submitting.value) {
    return
  }

  submitting.value = true

  try {
    if (!('password' in payload)) {
      throw new Error('Payload inválido para crear usuario.')
    }

    const hasAvailableEmail = await validateEmailAvailability(payload.email)

    if (!hasAvailableEmail) {
      return
    }

    await createAdminUser(normalizeCreateUserPayload(payload))

    notifySuccess('Usuario creado correctamente.', { id: 'admin-users-create-success' })
    await navigateTo('/admin/users')
  }
  catch (error) {
    const conflictMessage = resolveUserConflictMessage(error)

    if (conflictMessage) {
      notifyError(conflictMessage, { id: 'admin-users-create-conflict' })
      return
    }

    notifyApiError(error, 'No pudimos crear el usuario.', { id: 'admin-users-create-error' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <AdminPageShell
    title="Nuevo usuario"
    description="Crea una cuenta y asigna su rol operativo."
    primary-action-to="/admin/users"
    primary-action-label="Volver a usuarios"
  >
    <div class="mx-auto max-w-5xl space-y-5">
      <AdminOverviewPanel
        title="Datos del usuario"
        description="Completa identidad, contacto, rol y contraseña inicial."
        tone="subtle"
      >
        <template #actions>
          <div class="flex flex-wrap items-center gap-2.5">
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              {{ totalRoles }} roles
            </BaseBadge>
            <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
              acceso inicial
            </BaseBadge>
          </div>
        </template>

        <AdminUserForm
          v-model:dirty="isFormDirty"
          :role-options="roleOptions"
          :submitting="submitting"
          submit-label="Crear usuario"
          :include-password="true"
          @email-blur="handleEmailBlur"
          @submit="createUser"
        />
      </AdminOverviewPanel>
    </div>
  </AdminPageShell>
</template>
