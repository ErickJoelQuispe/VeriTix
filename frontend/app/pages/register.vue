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
      <AuthPanel
        panel-title="Create account"
        kicker="Secure signup"
        eyebrow="Register"
        title="Join VeriTix."
        description="Create your profile once, then keep tickets, saved events, and transfers in one place."
      >
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
            </BaseButton>
            <BaseButton kind="secondary" to="/login" size="lg" block>
              Already have an account?
            </BaseButton>
          </div>
        </FormRoot>

        <template #meta>
          By continuing, you accept the terms.
        </template>
      </AuthPanel>
    </main>
  </div>
</template>
