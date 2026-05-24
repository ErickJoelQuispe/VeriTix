<script setup lang="ts">
const currentYear = new Date().getFullYear()
const route = useRoute()

const isBackofficeRoute = computed(() => route.path.startsWith('/backoffice'))
</script>

<template>
  <footer id="footer" class="bg-transparent pt-24">
    <BaseContainer class="pb-12">
      <div class="flex flex-col justify-between gap-14 lg:flex-row lg:items-start">
        <h3 class="font-display text-5xl leading-none text-highlighted sm:text-6xl">
          Definí tu<br>
          frecuencia.
        </h3>

        <div v-if="isBackofficeRoute" class="grid w-full grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 lg:ml-auto lg:w-auto lg:grid-cols-3 lg:gap-16">
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Backoffice
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/backoffice">
                  Panel
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/backoffice/events">
                  Eventos
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/backoffice/genres">
                  Géneros
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/backoffice/concert-formats">
                  Formatos
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Entidades
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/backoffice/artists">
                  Artistas
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/backoffice/genres">
                  Géneros
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/backoffice/concert-formats">
                  Formatos
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/backoffice/venues">
                  Recintos
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/backoffice/users">
                  Usuarios
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Público
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/">
                  Inicio
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/events">
                  Eventos
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div v-else class="grid w-full grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 lg:ml-auto lg:w-auto lg:grid-cols-3 lg:gap-16">
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Descubrí
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/events">
                  Todos los eventos
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/events">
                  Recintos
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/events">
                  Artistas
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Plataforma
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/">
                  El registro
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/login">
                  Para creadores
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/events">
                  Protocolo de transferencias
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Compañía
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/">
                  Acerca de
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/">
                  Manifesto
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/">
                  Soporte
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="vtx-footer-separator mt-14 flex flex-col gap-3 pt-6 text-xs tracking-wide text-muted uppercase sm:flex-row sm:items-center sm:justify-between">
        <p class="font-display text-lg normal-case text-highlighted">
          VeriTix
        </p>
        <p>© {{ currentYear }} Infraestructura de VeriTix</p>
      </div>
    </BaseContainer>
  </footer>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.vtx-footer-separator {
  border-top: 1px solid color-mix(in srgb, var(--color-toned) 32%, transparent);
}
</style>
