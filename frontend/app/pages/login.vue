<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Iniciar sesión | VeriTix',
  description: 'Accede a tu cuenta de VeriTix para gestionar tus reservas y descubrir nuevos eventos.',
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
    <main class="grid min-h-[calc(100vh-78px)] place-items-center px-6 py-14 md:px-16 md:py-24">
      <AuthPanel
        panel-title="Sign in"
        kicker="Secure session"
        eyebrow="Access"
        title="Sign in."
        description="Pick up where you left off. Saved events, transfers, and tickets stay in one place."
      >
        <FormRoot ref="form" :state="state" :schema="schema" :validate-on="[]" class="space-y-4" @submit="onSubmit">
          <FormField v-model="state.email" name="email" label="Email" type="email" placeholder="name@domain.com" icon="i-lucide-mail" :disabled="pending" required />
          <FormPassword v-model="state.password" name="password" label="Password" placeholder="Enter your password" icon="i-lucide-lock" :disabled="pending" required />
          <div class="grid gap-3 pt-2">
            <BaseButton variant="primary" type="submit" size="lg" block :loading="pending">
              Sign in
            </BaseButton>
            <BaseButton variant="secondary" to="/register" size="lg" block>
              Create account
            </BaseButton>
          </div>
        </FormRoot>

        <template #meta>
          <NuxtLink to="/forgot-password" class="hover:text-primary">
            Forgot your password?
          </NuxtLink>
          <span>Ledger-backed access.</span>
        </template>
      </AuthPanel>
    </main>
  </div>
</template>
