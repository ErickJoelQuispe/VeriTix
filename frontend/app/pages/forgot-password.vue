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

const submitted = ref(false)

async function onSubmit() {
  if (!form.value) {
    return
  }

  submitted.value = true
}
</script>

<template>
  <div>
    <PageBackdrop :intensity="0.85" />

    <main class="relative grid min-h-[calc(100vh-78px)] place-items-center overflow-hidden px-4 py-12 sm:px-6 md:px-10 lg:px-16">
      <AuthPanel
        panel-title="Recuperación"
        kicker="Acceso"
        eyebrow="Olvidé mi contraseña"
        title="Recuperá tu cuenta."
        description="Te enviaremos un enlace de un solo uso al email para volver a entrar con seguridad."
      >
        <FormRoot ref="form" :state="state" :schema="schema" :validate-on="[]" class="space-y-4" @submit="onSubmit">
          <FormField v-model="state.email" name="email" label="Email" type="email" placeholder="nombre@dominio.com" icon="i-lucide-mail" required />

          <div class="grid gap-3 pt-2">
            <BaseButton variant="primary" type="submit" size="lg" block>
              Enviar enlace
            </BaseButton>
            <BaseButton variant="secondary" to="/login" size="lg" block>
              Volver al inicio de sesión
            </BaseButton>
          </div>
        </FormRoot>

        <template #meta>
          <span>Revisá spam si no llega enseguida.</span>
          <p v-if="submitted" class="text-primary">
            Revisá tu correo: si existe una cuenta, ya te mandamos el enlace.
          </p>
        </template>
      </AuthPanel>
    </main>
  </div>
</template>
