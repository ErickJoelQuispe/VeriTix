<script setup lang="ts">
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Ingresá un email válido').min(1, 'El email es obligatorio'),
})

const state = reactive({
  email: '',
})

const form = useTemplateRef('form')
const { forgotPassword } = useAuth()
const { notifyApiError } = useAppNotifications()

const submitted = ref(false)
const pending = ref(false)

async function onSubmit() {
  if (!form.value) return

  pending.value = true
  try {
    await forgotPassword(state.email.trim().toLowerCase())
    submitted.value = true
  }
  catch (error) {
    notifyApiError(error, 'Ocurrió un error. Por favor, intentá de nuevo.', { id: 'auth-forgot-error' })
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
              Recuperá tu acceso
            </h1>

            <p class="mx-auto mt-3 max-w-md text-sm text-toned">
              Ingresá tu email y si está registrado te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </header>

          <div class="mb-7 flex items-center justify-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-auric-300/30 bg-auric-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-auric-200 uppercase">
              <UIcon name="i-lucide-key-round" class="size-3.5" />
              Recuperación de contraseña
            </span>
          </div>

          <!-- Success state -->
          <div v-if="submitted" class="vtx-recovery-note">
            <UIcon name="i-lucide-mail-check" class="size-4 shrink-0 text-auric-300" />
            <p>
              Si ese email existe en nuestro sistema, vas a recibir un enlace de recuperación en los próximos minutos.
            </p>
          </div>

          <!-- Form state -->
          <UForm
            v-else
            ref="form"
            :state="state"
            :schema="schema"
            :validate-on="[]"
            class="flex flex-col gap-4"
            @submit="onSubmit"
          >
            <BaseFormField
              v-model="state.email"
              name="email"
              label="Email"
              type="email"
              placeholder="tu@email.com"
              icon="i-lucide-mail"
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
              Enviar enlace de recuperación
            </BaseButton>
          </UForm>

          <footer class="pt-1">
            <p class="text-center text-sm text-muted">
              <NuxtLink
                to="/login"
                class="rounded-sm font-medium text-auric-400 transition-colors duration-200 hover:text-auric-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
              >
                ← Volvé a iniciar sesión
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
