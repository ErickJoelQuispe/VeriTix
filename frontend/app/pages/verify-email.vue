<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Verificar email | VeriTix',
  description: 'Confirmá tu correo para activar tu cuenta de VeriTix.',
})

const route = useRoute()
const { verifyEmail: submitVerifyEmail } = useAuth()

const status = ref<'verifying' | 'success' | 'error'>('verifying')
const message = ref('Verificando tu correo...')

const token = computed(() => {
  const value = route.query.token
  return typeof value === 'string' ? value : ''
})

async function verifyToken() {
  if (!token.value) {
    status.value = 'error'
    message.value = 'Falta el token de verificación.'
    return
  }

  try {
    const response = await submitVerifyEmail({ token: token.value })

    status.value = 'success'
    message.value = response.message
  }
  catch {
    status.value = 'error'
    message.value = 'No pudimos verificar tu email. El enlace puede haber expirado.'
  }
}

onMounted(() => {
  void verifyToken()
})
</script>

<template>
  <div>
    <main class="relative grid min-h-[calc(100vh-78px)] place-items-center overflow-hidden px-4 py-12 sm:px-6 md:px-10 lg:px-16">
      <AuthPanel
        kicker="Verificación"
        eyebrow="Confirmá tu email"
        title="Activá tu cuenta."
        :description="status === 'success' ? 'Ya podés iniciar sesión con tu cuenta verificada.' : 'Usamos este paso para validar tu correo antes de habilitar el acceso.'"
      >
        <div class="rounded-2xl border border-warning/25 bg-warning/8 px-5 py-6 text-center text-sm shadow-sm sm:px-6">
          <BaseIcon
            :name="status === 'success' ? 'i-lucide-badge-check' : status === 'error' ? 'i-lucide-circle-alert' : 'i-lucide-loader-circle'"
            class="mx-auto mb-3 size-8"
            :class="status === 'success' ? 'text-success' : status === 'error' ? 'text-error' : 'text-warning animate-spin'"
          />

          <p class="leading-relaxed text-toned">
            {{ message }}
          </p>

          <div class="mt-5 flex justify-center">
            <BaseButton variant="primary" to="/login" size="lg">
              Ir al inicio de sesión
            </BaseButton>
          </div>
        </div>
      </AuthPanel>
    </main>
  </div>
</template>
