<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Restablecer contraseña | VeriTix',
  description: 'Establecé una nueva contraseña para tu cuenta de VeriTix.',
})

const route = useRoute()
const token = computed(() => (route.query.token as string) ?? '')

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener mayúscula, minúscula y número'),
    confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

const state = reactive({
  password: '',
  confirmPassword: '',
})

const { resetPassword } = useAuth()
const { notifyApiError } = useAppNotifications()

const pending = ref(false)
const success = ref(false)

async function onSubmit() {
  if (!token.value) {
    notifyApiError(null, 'Token de recuperación no encontrado. Solicitá un nuevo enlace.', {
      id: 'auth-reset-no-token',
    })
    return
  }

  const validation = schema.safeParse(state)
  if (!validation.success) {
    notifyApiError(null, validation.error.issues[0]?.message ?? 'Datos inválidos', {
      id: 'auth-reset-validation',
    })
    return
  }

  pending.value = true
  try {
    await resetPassword(token.value, state.password)
    success.value = true
    setTimeout(navigateTo, 3000, '/login')
  }
  catch (error) {
    notifyApiError(error, 'El enlace de recuperación es inválido o expiró. Solicitá uno nuevo.', {
      id: 'auth-reset-error',
    })
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <UiAuthPageShell variant="login">
    <UiAuthContainer>
      <div class="w-full max-w-lg px-4 sm:px-0">
        <section class="space-y-8">
          <header class="text-center">
            <UiMetaLabel tone="accent" class="mb-3 text-secondary/90">
              VeriTix
            </UiMetaLabel>

            <h1 class="font-display text-3xl text-highlighted md:text-4xl">
              Nueva contraseña
            </h1>

            <p class="mx-auto mt-3 max-w-md text-sm text-toned">
              Elegí una contraseña segura para tu cuenta.
            </p>
          </header>

          <div class="mb-7 flex items-center justify-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-auric-300/30 bg-auric-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-auric-200 uppercase">
              <BaseIcon name="i-lucide-shield-check" class="size-3.5" />
              Restablecimiento seguro
            </span>
          </div>

          <!-- Success state -->
          <div v-if="success" class="vtx-recovery-note">
            <BaseIcon name="i-lucide-check-circle" class="size-4 shrink-0 text-auric-300" />
            <p>
              ¡Contraseña actualizada! Redirigiendo a inicio de sesión...
            </p>
          </div>

          <!-- Form state -->
          <form
            v-else
            class="flex flex-col gap-4"
            @submit.prevent="onSubmit"
          >
            <BasePasswordField
              v-model="state.password"
              name="password"
              label="Nueva contraseña"
              placeholder="Mínimo 8 caracteres"
              icon="i-lucide-lock"
              :disabled="pending"
              required
              class="w-full"
            />

            <BasePasswordField
              v-model="state.confirmPassword"
              name="confirmPassword"
              label="Confirmá tu contraseña"
              placeholder="Repetí tu contraseña"
              icon="i-lucide-lock-keyhole"
              :disabled="pending"
              required
              class="w-full"
            />

            <BaseButton
              kind="primary"
              type="submit"
              size="lg"
              block
              :loading="pending"
              class="mt-2"
            >
              Actualizar contraseña
            </BaseButton>
          </form>

          <footer class="pt-1">
            <p class="text-center text-sm text-muted">
              <NuxtLink
                to="/forgot-password"
                class="rounded-sm font-medium text-auric-400 transition-colors duration-200 hover:text-auric-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
              >
                ← Solicitá un nuevo enlace
              </NuxtLink>
            </p>
          </footer>
        </section>
      </div>
    </UiAuthContainer>
  </UiAuthPageShell>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-recovery-note {
  @apply flex items-start gap-3 rounded-2xl border px-4 py-4 text-left text-sm leading-relaxed;
  color: var(--ui-text-toned);
  border-color: color-mix(in srgb, var(--color-auric-400) 22%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--ui-bg-elevated) 62%, transparent);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
}
</style>
