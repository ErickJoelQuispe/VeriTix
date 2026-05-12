<script setup lang="ts">
import type { UserRole } from '~~/shared/types'
import { z } from 'zod'

definePageMeta({
  layout: 'account',
  middleware: 'auth',
})

useSeoMeta({
  title: 'Ajustes de cuenta | VeriTix',
  description: 'Perfil, contacto y seguridad en una sola vista dentro de VeriTix.',
})

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'El teléfono debe estar en formato E.164 (ej: +34958123456)').or(z.literal('')),
  avatarUrl: z.string().url('Ingresá una URL válida').or(z.literal('')),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Debe incluir mayúscula, minúscula y número'),
  confirmPassword: z.string().min(1, 'Confirmá la nueva contraseña'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser distinta a la actual',
  path: ['newPassword'],
})

const profileState = reactive({
  name: '',
  lastName: '',
  phone: '',
  avatarUrl: '',
})

const passwordState = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const initialized = ref(false)
const profileSubmitting = ref(false)
const passwordSubmitting = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const { user, fetchProfile, updateProfile, changePassword } = useProfile()
const { notifyApiError, notifyInfo, notifySuccess } = useAppNotifications()

const roleViews: Record<UserRole, { title: string, capabilities: string[] }> = {
  BUYER: {
    title: 'Acceso de comprador',
    capabilities: [
      'Datos para compras y facturación',
      'Historial y uso de entradas',
      'Avisos relacionados con eventos',
    ],
  },
  CREATOR: {
    title: 'Acceso de creador',
    capabilities: [
      'Identidad comercial visible',
      'Gestión de eventos publicados',
      'Soporte operativo del perfil',
    ],
  },
  VALIDATOR: {
    title: 'Acceso de validador',
    capabilities: [
      'Asignación operativa del perfil',
      'Herramientas de validación',
      'Permisos según la operación',
    ],
  },
  ADMIN: {
    title: 'Acceso de administrador',
    capabilities: [
      'Control de cuenta y seguridad',
      'Paneles internos de gestión',
      'Permisos ampliados de soporte',
    ],
  },
}

const roleView = computed(() => {
  if (!user.value?.role) {
    return null
  }

  return roleViews[user.value.role]
})

const isAdmin = computed(() => user.value?.role === 'ADMIN')

const profileInitials = computed(() => {
  const initials = [profileState.name || user.value?.name, profileState.lastName || user.value?.lastName]
    .map(value => value?.trim()?.charAt(0)?.toUpperCase() ?? '')
    .join('')

  return initials || 'VT'
})

const hasProfileChanges = computed(() => {
  return (
    profileState.name.trim() !== user.value?.name
    || profileState.lastName.trim() !== user.value?.lastName
    || profileState.phone.trim() !== (user.value?.phone ?? '')
    || profileState.avatarUrl.trim() !== (user.value?.avatarUrl ?? '')
  )
})

function applyProfileState() {
  if (!user.value) {
    return
  }

  profileState.name = user.value.name
  profileState.lastName = user.value.lastName
  profileState.phone = user.value.phone ?? ''
  profileState.avatarUrl = user.value.avatarUrl ?? ''
}

async function loadProfile() {
  try {
    await fetchProfile()
    applyProfileState()
  }
  catch (error) {
    notifyApiError(error, 'No pudimos cargar la cuenta.', { id: 'profile-load-error' })
  }
  finally {
    initialized.value = true
  }
}

async function submitProfile() {
  if (!hasProfileChanges.value) {
    notifyInfo('No hay cambios para guardar.', { id: 'profile-no-changes' })
    return
  }

  profileSubmitting.value = true

  try {
    await updateProfile({
      name: profileState.name.trim(),
      lastName: profileState.lastName.trim(),
      phone: profileState.phone.trim(),
      avatarUrl: profileState.avatarUrl.trim() || undefined,
    })

    applyProfileState()
    notifySuccess('Perfil actualizado correctamente.', { id: 'profile-update-success' })
  }
  catch (error) {
    notifyApiError(error, 'No pudimos guardar el perfil.', { id: 'profile-update-error' })
  }
  finally {
    profileSubmitting.value = false
  }
}

async function submitPassword() {
  passwordSubmitting.value = true

  try {
    await changePassword({
      currentPassword: passwordState.currentPassword,
      newPassword: passwordState.newPassword,
    })

    passwordState.currentPassword = ''
    passwordState.newPassword = ''
    passwordState.confirmPassword = ''
    notifySuccess('Contraseña actualizada correctamente.', { id: 'security-update-success' })
  }
  catch (error) {
    notifyApiError(error, 'No pudimos actualizar la contraseña.', { id: 'security-update-error' })
  }
  finally {
    passwordSubmitting.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <section class="relative py-10 sm:py-14 lg:py-16">
    <BaseContainer class="relative">
      <div class="mx-auto max-w-7xl space-y-8 sm:space-y-9">
        <UiPageHeading
          eyebrow="Mi cuenta"
          title="Perfil y seguridad"
          description="Actualizá tus datos personales y protegé el acceso a tu cuenta."
        />

        <div class="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)] xl:gap-10">
          <section class="space-y-6">
            <div v-if="!initialized" class="space-y-4">
              <BaseSkeleton class="h-52 rounded-2xl" />
              <BaseSkeleton class="h-64 rounded-2xl" />
            </div>

            <div v-else class="space-y-6">
              <UiPanel variant="glass" radius="lg" padding="md" class="space-y-6">
                <div class="space-y-1 border-b border-default/55 pb-5">
                  <UiMetaLabel tone="accent">
                    Perfil
                  </UiMetaLabel>
                  <h2 class="text-xl font-semibold text-highlighted">
                    Datos personales
                  </h2>
                  <p class="max-w-2xl text-sm leading-relaxed text-toned">
                    Revisá la información visible de tu cuenta y mantené al día tus datos de contacto.
                  </p>
                </div>

                <FormRoot
                  :state="profileState"
                  :schema="profileSchema"
                  :validate-on="[]"
                  class="space-y-6"
                  @submit="submitProfile"
                >
                  <UsersProfileFields
                    v-model:name="profileState.name"
                    v-model:last-name="profileState.lastName"
                    v-model:phone="profileState.phone"
                    v-model:avatar-url="profileState.avatarUrl"
                  />

                  <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <span class="text-sm text-toned">Datos visibles y de contacto.</span>
                    <BaseButton
                      variant="primary"
                      type="submit"
                      size="md"
                      :loading="profileSubmitting"
                      :disabled="!hasProfileChanges"
                    >
                      Guardar perfil
                    </BaseButton>
                  </div>
                </FormRoot>
              </UiPanel>

              <UiPanel id="seguridad" variant="glass" radius="lg" padding="md" class="scroll-mt-28 space-y-6">
                <div class="space-y-1 border-b border-default/55 pb-5">
                  <UiMetaLabel tone="accent">
                    Seguridad
                  </UiMetaLabel>
                  <h2 class="text-xl font-semibold text-highlighted">
                    Acceso a la cuenta
                  </h2>
                  <p class="max-w-2xl text-sm leading-relaxed text-toned">
                    Cambiá tu contraseña y gestioná el cierre de sesión desde el mismo bloque de seguridad.
                  </p>
                </div>

                <FormRoot
                  :state="passwordState"
                  :schema="passwordSchema"
                  :validate-on="[]"
                  class="space-y-6"
                  @submit="submitPassword"
                >
                  <UsersPasswordFields
                    v-model:current-password="passwordState.currentPassword"
                    v-model:new-password="passwordState.newPassword"
                    v-model:confirm-password="passwordState.confirmPassword"
                    v-model:show-current-password="showCurrentPassword"
                    v-model:show-new-password="showNewPassword"
                    v-model:show-confirm-password="showConfirmPassword"
                  />

                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span class="text-sm text-toned">Acceso y protección de la cuenta.</span>
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <BaseButton
                        variant="secondary"
                        to="/users/me/logout"
                        size="md"
                      >
                        Cerrar sesión
                      </BaseButton>
                      <BaseButton
                        variant="primary"
                        type="submit"
                        size="md"
                        :loading="passwordSubmitting"
                      >
                        Actualizar contraseña
                      </BaseButton>
                    </div>
                  </div>
                </FormRoot>
              </UiPanel>
            </div>
          </section>

          <aside class="space-y-6">
            <ClientOnly>
              <UiPanel variant="glass" radius="lg" padding="md">
                <UsersProfileAside
                  :initials="profileInitials"
                  :full-name="`${profileState.name || user?.name || ''} ${profileState.lastName || user?.lastName || ''}`.trim()"
                  :email="user?.email ?? 'Sin email'"
                  :avatar-configured="Boolean(profileState.avatarUrl.trim())"
                  :phone="profileState.phone"
                  :is-admin="isAdmin"
                  :role-view="roleView"
                />
              </UiPanel>

              <template #fallback>
                <div class="space-y-4" aria-hidden="true">
                  <BaseSkeleton class="h-48 rounded-2xl" />
                  <BaseSkeleton class="h-24 rounded-2xl" />
                </div>
              </template>
            </ClientOnly>
          </aside>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
