<script setup lang="ts">
import type { UserRole } from '~~/shared/types'
import { z } from 'zod'

definePageMeta({
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
  <section class="vtx-settings-shell relative py-10 sm:py-12 lg:py-14">
    <BaseContainer class="relative">
      <div class="mx-auto max-w-6xl space-y-8 lg:space-y-10">
        <UiSectionHeading
          eyebrow="Ajustes"
          title="Perfil y seguridad"
          description="Actualiza tus datos personales y protege el acceso a tu cuenta desde un único espacio más claro."
          action-label="Cerrar sesión"
          action-to="/users/me/logout"
        />

        <div class="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)] xl:gap-10">
          <div class="min-w-0 space-y-6">
            <div v-if="!initialized" class="space-y-4">
              <BaseSkeleton class="h-11 rounded-2xl" />
              <BaseSkeleton class="h-11 rounded-2xl" />
              <BaseSkeleton class="h-11 rounded-2xl" />
              <BaseSkeleton class="h-11 rounded-2xl" />
              <BaseSkeleton class="h-11 rounded-2xl" />
            </div>

            <template v-else>
              <UiPanel as="article" variant="glass" padding="xl" radius="xl" class="space-y-0">
                <div class="space-y-2 border-b border-default/55 pb-5">
                  <UiMetaLabel>
                    Perfil
                  </UiMetaLabel>
                  <h2 class="text-2xl font-semibold text-highlighted sm:text-3xl">
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
                  class="space-y-6 pt-6"
                  @submit="submitProfile"
                >
                  <div class="space-y-6">
                    <section class="space-y-4 border-b border-default/55 pb-6">
                      <div class="space-y-2">
                        <h3 class="text-lg font-semibold text-highlighted">
                          Identidad
                        </h3>
                        <p class="text-sm leading-relaxed text-toned">
                          Nombre y datos visibles en tu cuenta.
                        </p>
                      </div>

                      <div class="grid gap-4 sm:grid-cols-2">
                        <FormField
                          v-model="profileState.name"
                          name="name"
                          label="Nombre"
                          placeholder="Nombre"
                          icon="i-lucide-user"
                          required
                        />

                        <FormField
                          v-model="profileState.lastName"
                          name="lastName"
                          label="Apellido"
                          placeholder="Apellido"
                          icon="i-lucide-user-round"
                          required
                        />
                      </div>
                    </section>

                    <section class="space-y-4 border-b border-default/55 pb-6">
                      <div class="space-y-2">
                        <h3 class="text-lg font-semibold text-highlighted">
                          Contacto
                        </h3>
                        <p class="text-sm leading-relaxed text-toned">
                          Canales que usamos para identificarte y mantener tu perfil al día.
                        </p>
                      </div>

                      <div class="grid gap-4">
                        <FormField
                          v-model="profileState.phone"
                          name="phone"
                          label="Teléfono"
                          help="Opcional · formato E.164"
                          type="tel"
                          placeholder="+34958123456"
                          icon="i-lucide-phone"
                        />

                        <FormField
                          v-model="profileState.avatarUrl"
                          name="avatarUrl"
                          label="Avatar URL"
                          help="Opcional"
                          type="url"
                          placeholder="https://..."
                          icon="i-lucide-image"
                        />
                      </div>
                    </section>
                  </div>

                  <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <span class="text-sm text-toned">
                      Datos visibles y de contacto.
                    </span>

                    <BaseButton
                      variant="primary"
                      type="submit"
                      size="lg"
                      class="vtx-profile-submit px-6"
                      :loading="profileSubmitting"
                      :disabled="!hasProfileChanges"
                    >
                      Guardar perfil
                    </BaseButton>
                  </div>
                </FormRoot>
              </UiPanel>

              <UiPanel id="seguridad" as="article" variant="glass" padding="xl" radius="xl" class="scroll-mt-28 space-y-0">
                <div class="space-y-2 border-b border-default/55 pb-5">
                  <UiMetaLabel>
                    Seguridad
                  </UiMetaLabel>
                  <h2 class="text-2xl font-semibold text-highlighted sm:text-3xl">
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
                  class="space-y-6 pt-6"
                  @submit="submitPassword"
                >
                  <div class="space-y-6">
                    <div class="space-y-2">
                      <div>
                        <UiMetaLabel>
                          Seguridad
                        </UiMetaLabel>
                        <h3 class="mt-3 text-2xl font-semibold text-highlighted">
                          Cambiar contraseña
                        </h3>
                      </div>

                      <p class="text-sm leading-relaxed text-toned">
                        Usá una clave nueva con al menos 8 caracteres, una mayúscula y un número.
                      </p>
                    </div>

                    <FormPassword
                      v-model="passwordState.currentPassword"
                      name="currentPassword"
                      label="Contraseña actual"
                      placeholder="Contraseña actual"
                      icon="i-lucide-lock"
                      :show="showCurrentPassword"
                      required
                      @update:show="showCurrentPassword = $event"
                    />

                    <div class="grid gap-5 lg:grid-cols-2">
                      <FormPassword
                        v-model="passwordState.newPassword"
                        name="newPassword"
                        label="Nueva contraseña"
                        help="8+ caracteres · mayúscula · minúscula · número"
                        placeholder="Nueva contraseña"
                        icon="i-lucide-shield"
                        :show="showNewPassword"
                        required
                        @update:show="showNewPassword = $event"
                      />

                      <FormPassword
                        v-model="passwordState.confirmPassword"
                        name="confirmPassword"
                        label="Confirmar contraseña"
                        placeholder="Confirmar contraseña"
                        icon="i-lucide-check-check"
                        :show="showConfirmPassword"
                        required
                        @update:show="showConfirmPassword = $event"
                      />
                    </div>
                  </div>

                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span class="text-sm text-toned">
                      Acceso y protección de la cuenta.
                    </span>

                    <BaseButton
                      variant="primary"
                      type="submit"
                      size="lg"
                      class="vtx-profile-submit px-6"
                      :loading="passwordSubmitting"
                    >
                      Actualizar contraseña
                    </BaseButton>
                  </div>
                </FormRoot>
              </UiPanel>
            </template>
          </div>

          <aside class="space-y-8">
            <ClientOnly>
              <div class="space-y-8">
                <section class="relative vtx-profile-presence space-y-5 border-b border-default/55 pb-8">
                  <div class="flex items-center gap-4">
                    <div class="vtx-profile-avatar flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-highlighted">
                      {{ profileInitials }}
                    </div>

                    <div>
                      <UiMetaLabel>
                        Identidad visible
                      </UiMetaLabel>
                      <p class="mt-2 text-lg font-semibold text-highlighted">
                        {{ `${profileState.name || user?.name || ''} ${profileState.lastName || user?.lastName || ''}`.trim() }}
                      </p>
                      <p class="mt-1 text-sm text-toned">
                        {{ user?.email ?? 'Sin email' }}
                      </p>
                    </div>
                  </div>

                  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div class="vtx-profile-signal">
                      <UiMetaLabel>
                        Avatar
                      </UiMetaLabel>
                      <p class="mt-2 text-sm font-semibold text-highlighted">
                        {{ profileState.avatarUrl.trim() ? 'Configurado' : 'Sin personalizar' }}
                      </p>
                    </div>

                    <div class="vtx-profile-signal">
                      <UiMetaLabel>
                        Teléfono
                      </UiMetaLabel>
                      <p class="mt-2 text-sm font-semibold text-highlighted">
                        {{ profileState.phone || 'Pendiente' }}
                      </p>
                    </div>
                  </div>
                </section>

                <section v-if="roleView" class="relative vtx-profile-role space-y-4 border-b border-default/55 pb-8">
                  <div>
                    <UiMetaLabel tone="accent">
                      {{ roleView.title }}
                    </UiMetaLabel>
                  </div>

                  <ul class="space-y-3">
                    <li
                      v-for="capability in roleView.capabilities"
                      :key="capability"
                      class="flex items-start gap-3 text-sm leading-relaxed text-toned"
                    >
                      <span class="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/14 text-primary">
                        <BaseIcon name="i-lucide-check" class="size-3.5" />
                      </span>
                      <span>{{ capability }}</span>
                    </li>
                  </ul>
                </section>

                <section class="space-y-3">
                  <UiMetaLabel>
                    Atajos
                  </UiMetaLabel>

                  <div class="flex flex-col gap-3">
                    <BaseButton to="/users/me/orders" variant="secondary" size="md">
                      Mis órdenes
                    </BaseButton>
                  </div>
                </section>
              </div>

              <template #fallback>
                <UiPanel variant="glass" padding="xl" radius="xl" class="space-y-0" aria-hidden="true">
                  <BaseSkeleton class="h-16 w-16 rounded-2xl" />
                  <BaseSkeleton class="mt-4 h-5 w-36 rounded" />
                  <BaseSkeleton class="mt-2 h-4 w-44 rounded" />
                </UiPanel>
              </template>
            </ClientOnly>
          </aside>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-settings-shell {
  isolation: isolate;
}

.vtx-profile-presence::before {
  @apply absolute -left-2 top-0 hidden h-28 w-28 rounded-full blur-3xl lg:block;
  content: '';
  background: radial-gradient(circle at center, rgb(239 170 71 / 0.16), rgb(255 255 255 / 0));
}

.vtx-profile-avatar {
  border: 1px solid rgb(239 170 71 / 0.45);
  background:
    radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.86), rgb(255 255 255 / 0) 38%),
    linear-gradient(135deg, rgb(239 170 71 / 0.4), rgb(44 189 230 / 0.4), rgb(240 100 127 / 0.28));
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.04),
    0 18px 34px -24px rgb(239 170 71 / 0.8);
}

.vtx-profile-signal {
  @apply relative pl-4;
}

.vtx-profile-signal::before {
  @apply absolute bottom-0 left-0 top-0 w-0.5 rounded-full;
  content: '';
  background: linear-gradient(180deg, rgb(239 170 71 / 0.9), rgb(44 189 230 / 0.8));
}

.vtx-profile-role::after {
  @apply absolute right-0 top-0 hidden h-20 w-20 rounded-full blur-2xl lg:block;
  content: '';
  background: radial-gradient(circle at center, rgb(44 189 230 / 0.14), rgb(255 255 255 / 0));
}

.vtx-profile-submit {
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-primary) 10%, transparent),
    color-mix(in srgb, var(--color-primary) 6%, transparent)
  );
  color: var(--color-highlighted);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.05),
    0 14px 28px -24px color-mix(in srgb, var(--color-primary) 42%, transparent);
  transition:
    transform 0.15s ease-out,
    border-color 0.15s ease-out,
    background-color 0.15s ease-out,
    box-shadow 0.15s ease-out,
    color 0.15s ease-out;
}

.vtx-profile-submit:hover {
  border-color: color-mix(in srgb, var(--color-primary) 26%, transparent);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-primary) 12%, transparent),
    color-mix(in srgb, var(--color-primary) 8%, transparent)
  );
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 18px 30px -24px color-mix(in srgb, var(--color-primary) 50%, transparent);
}

.vtx-profile-submit:active {
  transform: translateY(1px);
}
</style>
