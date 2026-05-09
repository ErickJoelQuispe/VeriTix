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

const logoutState = ref<'loading' | 'success' | 'error'>('loading')

onMounted(async () => {
  try {
    await logout()
    logoutState.value = 'success'
    notifySuccess('Sesión cerrada correctamente.', { id: 'auth-logout-success' })
  }
  catch (error) {
    notifyApiError(error, 'Error al cerrar sesión.', { id: 'auth-logout-error' })
    logoutState.value = 'error'
  }
})
</script>

<template>
  <main class="py-16 sm:py-20">
    <BaseContainer>
      <div class="mx-auto max-w-3xl space-y-10">
        <UiSectionHeading
          eyebrow="Cuenta"
          title="Cerrando sesión"
          description="Espera un momento mientras cerramos tu sesión de forma segura."
          center
        />

        <section class="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <template v-if="logoutState === 'loading'">
            <BaseIcon name="i-lucide-loader-2" class="size-10 animate-spin text-primary" />
            <p class="mt-6 text-lg font-medium text-highlighted">
              Cerrando sesión...
            </p>
            <p class="mt-2 text-sm text-toned">
              Saliendo de VeriTix de forma segura.
            </p>
          </template>

          <template v-else-if="logoutState === 'success'">
            <BaseIcon name="i-lucide-circle-check" class="size-8 text-success" />
            <p class="mt-6 text-lg font-medium text-highlighted">
              Sesión cerrada
            </p>
            <p class="mt-2 text-sm text-toned">
              Cerraste sesión correctamente.
            </p>
            <BaseButton
              variant="secondary"
              class="mt-8"
              @click="() => { router.push('/') }"
            >
              Volver al inicio
            </BaseButton>
          </template>

          <template v-else>
            <BaseIcon name="i-lucide-circle-alert" class="size-8 text-error" />
            <p class="mt-6 text-lg font-medium text-highlighted">
              Ha ocurrido un problema
            </p>
            <p class="mt-2 text-sm text-toned">
              No pudimos cerrar tu sesión. Volvé a intentarlo.
            </p>
            <BaseButton
              variant="primary"
              class="mt-8"
              @click="() => { router.push('/') }"
            >
              Volver al inicio
            </BaseButton>
          </template>
        </section>
      </div>
    </BaseContainer>
  </main>
</template>
