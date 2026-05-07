<script setup lang="ts">
const email = ref('')
const subscribed = ref(false)
const subscriptionError = ref('')
const currentYear = new Date().getFullYear()
const emailPattern = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

function handleSubscribe() {
  const normalizedEmail = email.value.trim()

  if (!normalizedEmail) {
    subscriptionError.value = 'Ingresá un correo para suscribirte.'
    subscribed.value = false
    return
  }

  const isValidEmail = emailPattern.test(normalizedEmail)

  if (!isValidEmail) {
    subscriptionError.value = 'Ingresá un correo válido.'
    subscribed.value = false
    return
  }

  subscriptionError.value = ''

  subscribed.value = true
  email.value = ''
}
</script>

<template>
  <footer
    id="footer"
    class="border-t border-default/75 bg-muted/40"
  >
    <UContainer class="py-12">
      <div class="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
        <div class="max-w-md space-y-5">
          <div class="space-y-2">
            <UiMetaLabel tone="accent">
              Cierre del ritual
            </UiMetaLabel>
            <p class="font-display text-3xl text-highlighted">
              VeriTix Newsletter
            </p>
          </div>

          <p class="text-sm text-toned">
            Enterate antes que nadie de nuevos conciertos, preventas y experiencias exclusivas con curaduría progresiva.
          </p>

          <form
            class="flex flex-col gap-3 sm:flex-row sm:items-center"
            @submit.prevent="handleSubscribe"
          >
            <label class="sr-only" for="newsletter-email">
              Correo para newsletter
            </label>

            <BaseFormInput
              id="newsletter-email"
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              aria-label="Correo para newsletter"
              class="w-full sm:w-64"
            />

            <BaseButton
              kind="secondary"
              type="submit"
              size="md"
              class="shrink-0 px-6"
            >
              Suscribirme
            </BaseButton>
          </form>

          <p
            v-if="subscribed"
            class="text-sm text-secondary"
          >
            Te has suscrito correctamente. Revisa tu correo para confirmar.
          </p>

          <p
            v-else-if="subscriptionError"
            class="text-sm text-error"
            role="alert"
          >
            {{ subscriptionError }}
          </p>
        </div>
      </div>

      <div class="mt-10 border-t border-default/75 pt-5 text-xs tracking-wide text-muted uppercase">
        © {{ currentYear }} Veritix. Todos los derechos reservados.
      </div>
    </UContainer>
  </footer>
</template>
