<script setup lang="ts">
import type {
  BackofficeUpdateUserPayload,
  BackofficeUserRecord,
} from '~~/shared/types'
import { useBackofficeUsersRepository } from '@/repositories/backofficeUsersRepository'
import { hasUserSemanticChanges, normalizeUpdateUserPayload } from '@/utils/backoffice/formSafeRails'

definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })
useSeoMeta({ title: 'Editar usuario | Backoffice VeriTix' })

const route = useRoute()
const userId = computed(() => String(route.params.id || ''))

const { getUser: getBackofficeUser, updateUser: updateBackofficeUser, isEmailTaken } = useBackofficeUsersRepository()
const { roleOptions } = useBackofficeApi()
const { getApiErrorMessage, getApiErrorStatus } = useApiErrorMessage()
const { notifyApiError, notifyError, notifyInfo, notifySuccess } = useAppNotifications()

const user = ref<BackofficeUserRecord | null>(null)
const loading = ref(true)
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

  if (!normalizedEmail || !user.value) {
    return true
  }

  if (normalizedEmail.toLowerCase() === user.value.email.trim().toLowerCase()) {
    return true
  }

  const emailExists = await isEmailTaken(normalizedEmail, userId.value)

  if (emailExists) {
    notifyError('Ya existe un usuario con ese correo.', { id: 'admin-users-email-conflict-edit' })
    return false
  }

  return true
}

async function handleEmailBlur(email: string) {
  if (submitting.value || !user.value) {
    return
  }

  try {
    await validateEmailAvailability(email)
  }
  catch {
  }
}

async function loadUser() {
  loading.value = true

  try {
    user.value = await getBackofficeUser(userId.value)
  }
  catch (error) {
    if (getApiErrorStatus(error) === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuario no encontrado.',
      })
    }

    notifyApiError(error, 'No pudimos cargar el usuario.', { id: 'admin-users-load-error-edit' })
  }
  finally {
    loading.value = false
  }
}

async function updateUser(payload: BackofficeUpdateUserPayload) {
  if (submitting.value || !user.value) {
    return
  }

  const normalizedPayload = normalizeUpdateUserPayload(payload)

  if (!hasUserSemanticChanges(user.value, normalizedPayload)) {
    notifyInfo('No hay cambios para guardar.', { id: 'admin-users-no-changes' })
    return
  }

  submitting.value = true

  try {
    const hasAvailableEmail = await validateEmailAvailability(normalizedPayload.email ?? '')

    if (!hasAvailableEmail) {
      return
    }

    user.value = await updateBackofficeUser(userId.value, normalizedPayload)

    notifySuccess('Usuario actualizado correctamente.', { id: 'admin-users-update-success' })
  }
  catch (error) {
    const conflictMessage = resolveUserConflictMessage(error)

    if (conflictMessage) {
      notifyError(conflictMessage, { id: 'admin-users-update-conflict' })
      return
    }

    notifyApiError(error, 'No pudimos actualizar el usuario.', { id: 'admin-users-update-error' })
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadUser()
})
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <div class="space-y-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <UiPageHeading eyebrow="Backoffice" title="Editar usuario" description="Actualiza perfil, permisos y estado de acceso del usuario." />
          <BackofficeBackButton
            to="/backoffice/users"
          >
            Volver a usuarios
          </BackofficeBackButton>
        </div>
        <PagesBackofficeOverviewPanel
          title="Datos del usuario"
          description="Edita contacto, rol, estado y verificación de cuenta."
          variant="glass"
        >
          <template #actions>
            <div v-if="user" class="flex flex-wrap items-center gap-2.5">
              <BaseBadge kind="info" size="sm" class="min-w-24 justify-center">
                {{ totalRoles }} roles
              </BaseBadge>
              <BaseBadge kind="status" :color="user.isActive ? 'success' : 'neutral'" size="sm" class="min-w-24 justify-center">
                {{ user.isActive ? 'ACTIVO' : 'INACTIVO' }}
              </BaseBadge>
              <BaseBadge kind="status" :color="user.emailVerified ? 'success' : 'warning'" size="sm" class="min-w-24 justify-center">
                {{ user.emailVerified ? 'VERIFICADO' : 'PENDIENTE' }}
              </BaseBadge>
            </div>
          </template>

          <template v-if="loading">
            <div class="space-y-4">
              <BaseSkeleton class="h-12 w-full rounded-xl" />
              <BaseSkeleton class="h-12 w-full rounded-xl" />
              <BaseSkeleton class="h-12 w-full rounded-xl" />
              <BaseSkeleton class="h-12 w-full rounded-xl" />
            </div>
          </template>

          <PagesBackofficeUserForm
            v-else-if="user"
            v-model:dirty="isFormDirty"
            :initial-value="user"
            :role-options="roleOptions"
            :submitting="submitting"
            submit-label="Guardar cambios"
            :include-password="false"
            @email-blur="handleEmailBlur"
            @submit="updateUser"
          />
        </PagesBackofficeOverviewPanel>
      </div>
    </BaseContainer>
  </section>
</template>
