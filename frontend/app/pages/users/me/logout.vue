<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Cerrando sesión | VeriTix',
})

const { logout } = useAuth()
const { notifyApiError, notifySuccess } = useAppNotifications()
const router = useRouter()

const loggingOut = ref(true)

onMounted(async () => {
  try {
    await logout()
    notifySuccess('Sesión cerrada correctamente.', { id: 'auth-logout-success' })
    await router.push('/')
  }
  catch (error) {
    notifyApiError(error, 'Error al cerrar sesión.', { id: 'auth-logout-error' })
    loggingOut.value = false
  }
})
</script>

<template>
  <UsersSettingsShell
    title="Cerrando sesión"
    description="Espera un momento mientras cerramos tu sesión de forma segura."
    tone="minimal"
  >
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <template v-if="loggingOut">
        <UIcon name="i-lucide-loader-2" class="size-10 animate-spin text-auric-400" />
        <p class="mt-6 text-lg font-medium text-highlighted">
          Cerrando sesión...
        </p>
        <p class="mt-2 text-sm text-toned">
          Saliendo de VeriTix de forma segura.
        </p>
      </template>

      <template v-else>
        <div class="mx-auto rounded-full bg-error/10 p-4 text-error w-fit">
          <UIcon name="i-lucide-alert-circle" class="size-8" />
        </div>
        <p class="mt-6 text-lg font-medium text-highlighted">
          Ha ocurrido un problema
        </p>
        <p class="mt-2 text-sm text-toned">
          No pudimos cerrar tu sesión. Volvé a intentarlo.
        </p>
        <BaseButton
          kind="primary"
          class="mt-8"
          @click="() => { router.push('/') }"
        >
          Volver al inicio
        </BaseButton>
      </template>
    </div>
  </UsersSettingsShell>
</template>
