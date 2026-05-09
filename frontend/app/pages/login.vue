<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Iniciar sesión | VeriTix',
  description: 'Entrá a tu cuenta de VeriTix para gestionar tus reservas y descubrir nuevos eventos.',
})

const schema = z.object({
  email: z.string().email('Ingresá un email válido').min(1, 'El email es obligatorio'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

const state = reactive({
  email: '',
  password: '',
})

const form = useTemplateRef('form')
const { login, pending } = useAuth()
const { notifyApiError, notifySuccess } = useAppNotifications()

async function onSubmit() {
  if (!form.value) {
    return
  }

  try {
    await login({
      email: state.email.trim().toLowerCase(),
      password: state.password,
    })

    notifySuccess('Sesión iniciada correctamente.', { id: 'auth-login-success' })
    await navigateTo('/')
  }
  catch (error) {
    notifyApiError(error, 'Credenciales incorrectas. Por favor, intentá de nuevo.', { id: 'auth-login-error' })
  }
}
</script>

<template>
  <div>
    <main class="relative grid min-h-[calc(100vh-78px)] place-items-center overflow-hidden px-4 py-12 sm:px-6 md:px-10 lg:px-16">
      <AuthPanel
        kicker="Sesión"
        eyebrow="Bienvenido"
        title="Entrá a VeriTix."
        description="Retomá tus reservas, tickets y eventos guardados en un solo lugar."
      >
        <FormRoot ref="form" :state="state" :schema="schema" :validate-on="[]" class="space-y-5 sm:space-y-6" @submit="onSubmit">
          <FormField v-model="state.email" name="email" label="Email" type="email" placeholder="nombre@dominio.com" icon="i-lucide-mail" :disabled="pending" required />
          <FormPassword v-model="state.password" name="password" label="Contraseña" placeholder="Ingresá tu contraseña" icon="i-lucide-lock" :disabled="pending" required />
          <div class="grid gap-4 pt-6">
            <BaseButton variant="primary" type="submit" size="lg" block :loading="pending">
              Entrar
            </BaseButton>
            <BaseButton variant="secondary" to="/register" size="lg" block>
              Crear cuenta
            </BaseButton>
          </div>
        </FormRoot>

        <template #meta>
          <NuxtLink to="/forgot-password" class="hover:text-primary">
            ¿Olvidaste tu contraseña?
          </NuxtLink>
        </template>
      </AuthPanel>
    </main>
  </div>
</template>
