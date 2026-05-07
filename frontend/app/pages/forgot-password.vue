<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'guest',
})

useSeoMeta({
  title: 'Recuperar acceso | VeriTix',
  description: 'Pantalla de recuperacion de acceso de VeriTix con una composicion completa y coherente con el resto de la experiencia.',
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
    <main class="grid min-h-[calc(100vh-78px)] place-items-center px-6 py-14 md:px-16 md:py-24">
      <section class="w-full max-w-[520px] overflow-hidden rounded-[18px] border border-default/80 bg-elevated/75 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
        <div class="flex items-center justify-between border-b border-default/70 px-6 py-5">
          <strong class="font-display text-3xl font-normal">Reset password</strong><span class="font-mono text-[0.68rem] tracking-[0.12em] text-muted uppercase">Secure link</span>
        </div><div class="px-6 pb-6 pt-7">
          <span class="mb-3 block font-mono text-xs tracking-[0.1em] text-muted uppercase">Recovery</span><h1 class="font-display text-6xl leading-[0.95]">
            Reset access.
          </h1><p class="mb-7 mt-3 max-w-[34ch] text-toned">
            We’ll send a one-time link to your email so you can get back to your tickets safely.
          </p>
          <FormRoot ref="form" :state="state" :schema="schema" :validate-on="[]" class="space-y-4" @submit="onSubmit">
            <FormField v-model="state.email" name="email" label="Email" type="email" placeholder="name@domain.com" icon="i-lucide-mail" required />
            <div class="grid gap-3 pt-2">
              <BaseButton kind="primary" type="submit" size="lg" block>
                Send reset link
              </BaseButton><BaseButton kind="secondary" to="/login" size="lg" block>
                Back to sign in
              </BaseButton>
            </div>
          </FormRoot>
          <div class="mt-4 text-sm text-muted">
            Check spam if you don’t see it in a minute.
          </div>
          <p v-if="submitted" class="mt-3 rounded-xl border border-default/70 bg-default/20 px-4 py-3 text-sm text-toned" role="status">
            Check spam if you don’t see it in a minute.
          </p>
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
