<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Registro | VeriTix',
  description: 'Crea tu cuenta de VeriTix y descubre los mejores conciertos progresivos.',
})

const schema = z.object({
  email: z.string().email('Ingresá un email válido').min(1, 'El email es obligatorio'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'El teléfono debe estar en formato E.164 (ej: +34958123456)'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Debe incluir mayúscula, minúscula y número'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

const state = reactive({
  email: '',
  name: '',
  lastName: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const form = useTemplateRef('form')
const showPassword = ref(false)
const { register, pending } = useAuth()
const { notifyApiError, notifySuccess } = useAppNotifications()

async function onSubmit() {
  if (!form.value) {
    return
  }

  try {
    await register({
      email: state.email.trim().toLowerCase(),
      password: state.password,
      name: state.name.trim(),
      lastName: state.lastName.trim(),
      phone: state.phone.trim(),
    })

    notifySuccess('Cuenta creada correctamente.', { id: 'auth-register-success' })
    await navigateTo('/')
  }
  catch (error) {
    notifyApiError(error, 'Error al crear la cuenta. Por favor, intentá de nuevo.', { id: 'auth-register-error' })
  }
}
</script>

<template>
  <div>
    <main class="grid min-h-[calc(100vh-78px)] place-items-center px-6 py-14 md:px-16 md:py-24">
      <section class="w-full max-w-[520px] overflow-hidden rounded-[18px] border border-default/80 bg-elevated/75 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
        <div class="flex items-center justify-between border-b border-default/70 px-6 py-5">
          <strong class="font-display text-3xl font-normal">Create account</strong><span class="font-mono text-[0.68rem] tracking-[0.12em] text-muted uppercase">Secure signup</span>
        </div>
        <div class="px-6 pb-6 pt-7">
          <span class="mb-3 block font-mono text-xs tracking-[0.1em] text-muted uppercase">Register</span>
          <h1 class="font-display text-6xl leading-[0.95]">
            Join VeriTix.
          </h1>
          <p class="mb-7 mt-3 max-w-[34ch] text-toned">
            Create your profile once, then keep tickets, saved events, and transfers in one place.
          </p>
          <FormRoot ref="form" :state="state" :schema="schema" :validate-on="[]" class="space-y-4" @submit="onSubmit">
            <FormField v-model="state.name" name="name" label="Name" placeholder="Your name" icon="i-lucide-user" required />
            <FormField v-model="state.email" name="email" label="Email" type="email" placeholder="name@domain.com" icon="i-lucide-mail" required />
            <FormPassword v-model="state.password" name="password" label="Password" placeholder="Create a password" icon="i-lucide-lock" :show="showPassword" required @update:show="showPassword = $event" />
            <FormField v-model="state.lastName" name="lastName" label="Last name" placeholder="Last name" icon="i-lucide-user-round" required />
            <FormField v-model="state.phone" name="phone" label="Phone" placeholder="+34958123456" icon="i-lucide-phone" required />
            <FormPassword v-model="state.confirmPassword" name="confirmPassword" label="Confirm password" placeholder="Repeat password" icon="i-lucide-lock" :show="showPassword" required @update:show="showPassword = $event" />
            <div class="grid gap-3 pt-2">
              <BaseButton kind="primary" type="submit" size="lg" block :loading="pending">
                Create account
              </BaseButton><BaseButton kind="secondary" to="/login" size="lg" block>
                Already have an account?
              </BaseButton>
            </div>
          </FormRoot>
          <div class="mt-4 text-sm text-muted">
            By continuing, you accept the terms.
          </div>
        </div>
      </section>
    </main>
    <footer class="mx-auto flex w-full max-w-[1400px] items-center justify-between border-t border-default px-6 pb-10 pt-7 text-sm text-muted md:px-16">
      <div class="font-display text-2xl text-highlighted">
        VeriTix
      </div><p class="font-mono text-[0.68rem] tracking-[0.12em] uppercase">
        © 2024 VERITIX INFRASTRUCTURE
      </p>
    </footer>
  </div>
</template>
