<template>
  <AuthShell variant="login">
    <div class="w-full max-w-lg px-4 sm:px-0">
      <section class="space-y-8">
        <header class="text-center">
          <UiMetaLabel tone="accent" class="mb-3 text-secondary/90">
            VeriTix
          </UiMetaLabel>

          <h1 class="font-display text-3xl text-highlighted md:text-4xl">
            Recupera tu acceso
          </h1>

          <p class="mx-auto mt-3 max-w-md text-sm text-toned">
            Esta pantalla ahora sigue la misma familia visual que inicio de sesión y te guía solo hacia las acciones reales disponibles.
          </p>
        </header>

        <div class="mb-7 flex items-center justify-center">
          <span class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary/80 uppercase">
            <BaseIcon name="i-lucide-key-round" class="size-3.5" />
            Recuperación no disponible
          </span>
        </div>

        <div class="space-y-4 text-center">
          <p class="text-sm leading-relaxed text-toned">
            El restablecimiento automático de contraseña todavía no está habilitado. Si aún recordás tu clave, volvé a iniciar sesión. Si conservás una sesión activa en otro dispositivo, cambiá la contraseña desde seguridad dentro de tu cuenta.
          </p>

          <div class="vtx-recovery-note">
            <BaseIcon name="i-lucide-shield-check" class="size-4 text-primary" />
            <p>
              Evitamos prometer un flujo que aún no existe y te dejamos las rutas seguras que sí funcionan hoy.
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <BaseButton kind="primary" to="/login" size="lg" block>
            Volvé a iniciar sesión
          </BaseButton>

          <BaseButton kind="secondary" to="/" size="lg" block>
            Ir al inicio
          </BaseButton>
        </div>

        <footer class="pt-1">
          <p class="text-center text-xs text-toned">
            Cuando el flujo de recuperación exista, esta pantalla podrá conectarse a él sin romper la experiencia visual de autenticación.
          </p>
        </footer>
      </section>
    </div>
  </AuthShell>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-recovery-note {
  @apply flex items-start gap-3 rounded-2xl border px-4 py-4 text-left text-sm leading-relaxed;
  color: var(--color-toned);
  border-color: color-mix(in srgb, var(--color-primary) 22%, transparent);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.015)),
    color-mix(in srgb, var(--color-elevated) 62%, transparent);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
}
</style>
