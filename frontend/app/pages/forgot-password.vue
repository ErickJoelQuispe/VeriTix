<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Recuperar acceso | VeriTix',
  description: 'Pedí un enlace para recuperar el acceso a tu cuenta de VeriTix.',
})

const schema = z.object({
  email: z.string().email('Ingresá un email válido').min(1, 'El email es obligatorio'),
})

const state = reactive({ email: '' })
const form = useTemplateRef('form')
const { forgotPassword, pending } = useAuth()
const { notifyApiError, notifySuccess } = useAppNotifications()

const submitted = ref(false)
const successMessage = ref('')

async function onSubmit() {
  if (!form.value) {
    return
  }

  try {
    const response = await forgotPassword(state.email.trim().toLowerCase())
    successMessage.value = response.message
    submitted.value = true
    notifySuccess(response.message, { id: 'auth-forgot-password-success' })
  }
  catch (error) {
    notifyApiError(error, 'No pudimos enviar el enlace. Por favor, intentá de nuevo.', { id: 'auth-forgot-password-error' })
  }
}
</script>

<template>
  <div>
    <main class="relative grid min-h-[calc(100vh-78px)] place-items-center overflow-hidden px-4 py-12 sm:px-6 md:px-10 lg:px-16">
      <AuthPanel
        kicker="Acceso"
        eyebrow="Recuperá tu acceso"
        title="Volvé a entrar."
        description="Te enviaremos un enlace de un solo uso al email para volver a entrar con seguridad. Recuerda revisar tu carpeta de spam."
      >
        <FormRoot v-if="!submitted" ref="form" :state="state" :schema="schema" :validate-on="[]" class="space-y-5 sm:space-y-6" @submit="onSubmit">
          <FormField v-model="state.email" name="email" label="Correo electrónico" type="email" placeholder="nombre@dominio.com" icon="i-lucide-mail" :disabled="pending" required />

          <div class="grid gap-4 pt-6">
            <BaseButton variant="primary" type="submit" size="lg" block :loading="pending">
              Enviar enlace
            </BaseButton>
            <BaseButton variant="secondary" to="/login" size="lg" block>
              Volver al inicio de sesión
            </BaseButton>
          </div>
        </FormRoot>

        <div v-else class="rounded-2xl border border-warning/25 bg-warning/8 px-5 py-6 text-center text-sm shadow-sm sm:px-6">
          <BaseIcon name="i-lucide-mail-check" class="mx-auto mb-3 size-8 text-warning" />
          <p class="leading-relaxed text-toned">
            {{ successMessage || 'Revisá tu correo: si existe una cuenta, ya te mandamos el enlace.' }}
          </p>
        </div>
      </AuthPanel>
    </main>
  </div>
</template>
