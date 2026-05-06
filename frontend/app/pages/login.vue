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
    <header class="sticky top-0 z-50 flex items-center justify-between border-b border-default/70 bg-default/85 px-6 py-4 backdrop-blur md:px-16">
      <div class="flex flex-col gap-1">
        <div class="font-display text-2xl">
          VeriTix
        </div>
        <div class="font-mono text-[0.68rem] tracking-[0.12em] text-muted uppercase">
          Live events / ledger access
        </div>
      </div>
      <BaseButton kind="secondary" to="/">
        Home
      </BaseButton>
    </header>
    <main class="grid min-h-[calc(100vh-78px)] place-items-center px-6 py-14 md:px-16 md:py-24">
      <section class="w-full max-w-[520px] overflow-hidden rounded-[18px] border border-default/80 bg-elevated/75 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
        <div class="flex items-center justify-between border-b border-default/70 px-6 py-5">
          <strong class="font-display text-3xl font-normal">Sign in</strong>
          <span class="font-mono text-[0.68rem] tracking-[0.12em] text-muted uppercase">Secure session</span>
        </div>
        <div class="px-6 pb-6 pt-7">
          <span class="mb-3 block font-mono text-xs tracking-[0.1em] text-muted uppercase">Access</span>
          <h1 class="font-display text-6xl leading-[0.95]">
            Sign in.
          </h1>
          <p class="mb-7 mt-3 max-w-[34ch] text-toned">
            Pick up where you left off. Saved events, transfers, and tickets stay in one place.
          </p>
          <FormRoot ref="form" :state="state" :schema="schema" :validate-on="[]" class="space-y-4" @submit="onSubmit">
            <FormField v-model="state.email" name="email" label="Email" type="email" placeholder="name@domain.com" icon="i-lucide-mail" :disabled="pending" required />
            <FormPassword v-model="state.password" name="password" label="Password" placeholder="Enter your password" icon="i-lucide-lock" :disabled="pending" required />
            <div class="grid gap-3 pt-2">
              <BaseButton kind="primary" type="submit" size="lg" block :loading="pending">
                Sign in
              </BaseButton>
              <BaseButton kind="secondary" to="/register" size="lg" block>
                Create account
              </BaseButton>
            </div>
          </FormRoot>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <NuxtLink to="/forgot-password" class="hover:text-primary">
              Forgot your password?
            </NuxtLink>
            <span>Ledger-backed access.</span>
          </div>
        </div>
      </section>
    </main>
    <footer class="mx-auto flex w-full max-w-[1400px] items-center justify-between border-t border-default px-6 pb-10 pt-7 text-sm text-muted md:px-16">
      <div class="font-display text-2xl text-highlighted">
        VeriTix
      </div>
      <p class="font-mono text-[0.68rem] tracking-[0.12em] uppercase">
        © 2024 VERITIX INFRASTRUCTURE
      </p>
    </footer>
  </div>
</template>
