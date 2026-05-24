<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Registro | VeriTix',
  description: 'Creá tu cuenta de VeriTix y descubrí los mejores conciertos progresivos.',
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
const submitted = ref(false)
const successMessage = ref('')

async function onSubmit() {
  if (!form.value) {
    return
  }

  try {
    const response = await register({
      email: state.email.trim().toLowerCase(),
      password: state.password,
      name: state.name.trim(),
      lastName: state.lastName.trim(),
      phone: state.phone.trim(),
    })

    successMessage.value = response.message
    submitted.value = true
    notifySuccess(response.message, { id: 'auth-register-success' })
  }
  catch (error) {
    notifyApiError(error, 'Error al crear la cuenta. Por favor, intentá de nuevo.', { id: 'auth-register-error' })
  }
}
</script>

<template>
  <div>
    <main class="relative grid min-h-[calc(100vh-78px)] place-items-center overflow-hidden px-4 py-12 sm:px-6 md:px-10 lg:px-16">
      <AuthPanel
        kicker="Registro"
        eyebrow="Creá tu cuenta"
        title="Unite a VeriTix."
        description="Creá tu perfil en segundos y empezá a seguir artistas, venues y eventos."
      >
        <FormRoot v-if="!submitted" ref="form" :state="state" :schema="schema" :validate-on="[]" class="space-y-5 sm:space-y-6" @submit="onSubmit">
          <FormField v-model="state.name" name="name" label="Nombre" placeholder="Tu nombre" icon="i-lucide-user" required />
          <FormField v-model="state.lastName" name="lastName" label="Apellido" placeholder="Tu apellido" icon="i-lucide-user-round" required />
          <FormField v-model="state.email" name="email" label="Correo electrónico" type="email" placeholder="nombre@dominio.com" icon="i-lucide-mail" required />
          <FormField v-model="state.phone" name="phone" label="Teléfono" placeholder="+34958123456" icon="i-lucide-phone" required />
          <FormPassword v-model="state.password" name="password" label="Contraseña" placeholder="Creá una contraseña" icon="i-lucide-lock" :show="showPassword" required @update:show="showPassword = $event" />
          <FormPassword v-model="state.confirmPassword" name="confirmPassword" label="Confirmar contraseña" placeholder="Repetí la contraseña" icon="i-lucide-lock" :show="showPassword" required @update:show="showPassword = $event" />
          <div class="grid gap-4 pt-6">
            <BaseButton variant="primary" type="submit" size="lg" block :loading="pending">
              Crear cuenta
            </BaseButton>
            <BaseButton variant="secondary" to="/login" size="lg" block>
              Ya tengo cuenta
            </BaseButton>
          </div>
        </FormRoot>

        <div v-else class="rounded-2xl border border-warning/25 bg-warning/8 px-5 py-6 text-center text-sm shadow-sm sm:px-6">
          <BaseIcon name="i-lucide-mail-check" class="mx-auto mb-3 size-8 text-warning" />
          <p class="leading-relaxed text-toned">
            {{ successMessage || 'Revisá tu correo para verificar la cuenta antes de iniciar sesión.' }}
          </p>
          <div class="mt-5 flex justify-center">
            <BaseButton variant="primary" to="/login" size="lg">
              Ir al inicio de sesión
            </BaseButton>
          </div>
        </div>

        <template #meta>
          <span>Al continuar aceptás los términos.</span>
        </template>
      </AuthPanel>
    </main>
  </div>
</template>
