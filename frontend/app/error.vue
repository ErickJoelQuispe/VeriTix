<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const isNotFound = computed(() => props.error?.statusCode === 404)

function goHome() {
  clearError({ redirect: '/' })
}

useSeoMeta({
  title: computed(() => isNotFound.value ? '404 | VeriTix' : 'Error | VeriTix'),
})
</script>

<template>
  <NuxtLayout>
    <main class="py-16 sm:py-20">
      <BaseContainer>
        <div class="mx-auto max-w-4xl space-y-10">
          <UiSectionHeading
            eyebrow="Error"
            :title="isNotFound ? 'Página no encontrada' : 'Ha ocurrido un problema'"
            :description="isNotFound ? 'La página que buscás no existe, fue movida o el enlace está desactualizado.' : 'Ocurrió un error inesperado. Probá volver al inicio y reintentá la acción.'"
            center
          />

          <UiGlassPanel tone="subtle" radius="xl" padding="lg" class="mx-auto max-w-2xl">
            <section class="flex min-h-[34vh] flex-col items-center justify-center text-center">
              <BaseIcon
                :name="isNotFound ? 'i-lucide-search-x' : 'i-lucide-circle-alert'"
                :class="isNotFound ? 'text-toned' : 'text-error'"
                class="size-10"
              />

              <p class="mt-6 text-sm text-toned">
                {{ props.error?.statusCode ? `Código ${props.error.statusCode}` : 'Sin código de estado' }}
              </p>

              <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
                <BaseButton variant="primary" @click="goHome">
                  Volver al inicio
                </BaseButton>
                <BaseButton variant="secondary" @click="() => clearError()">
                  Reintentar
                </BaseButton>
              </div>
            </section>
          </UiGlassPanel>
        </div>
      </BaseContainer>
    </main>
  </NuxtLayout>
</template>
