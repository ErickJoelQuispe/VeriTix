<script setup lang="ts">
definePageMeta({ layout: 'backoffice', middleware: 'backoffice' })

useSeoMeta({
  title: 'Backoffice | VeriTix',
  description: 'Entrada principal del backoffice con acceso rápido a dashboard y entidades.',
})

const links = [
  { order: '01', title: 'Dashboard', description: 'KPIs and activity.', to: '/backoffice/dashboard' },
  { order: '02', title: 'Events', description: 'Search, filters, cards.', to: '/backoffice/events' },
  { order: '03', title: 'Artists', description: 'Roster and status.', to: '/backoffice/artists' },
  { order: '04', title: 'Venues', description: 'Capacity and open state.', to: '/backoffice/venues' },
  { order: '05', title: 'Users', description: 'Roles and verification.', to: '/backoffice/users' },
] as const
</script>

<template>
  <section class="py-10 sm:py-12 lg:py-14">
    <BaseContainer>
      <main class="mx-auto max-w-6xl rounded-[20px] border border-default/75 bg-elevated/75 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-8">
        <UiMetaLabel tone="accent" class="mb-3.5">
          Backoffice
        </UiMetaLabel>
        <h1 class="font-display text-5xl leading-[0.92] tracking-tight text-highlighted sm:text-6xl">
          Admin pages.
        </h1>
        <p class="mt-3 max-w-3xl text-toned">
          Dashboard principal y entidades separadas, todas con el mismo sistema visual y sin texto de relleno.
        </p>

        <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded-2xl border border-default/70 bg-default/20 p-4 transition hover:-translate-y-0.5 hover:border-primary/50"
          >
            <p class="font-mono text-[0.68rem] tracking-[0.12em] text-muted uppercase">
              {{ link.order }}
            </p>
            <p class="mt-2 font-display text-3xl leading-[0.95] text-highlighted">
              {{ link.title }}
            </p>
            <p class="mt-2 text-sm text-toned">
              {{ link.description }}
            </p>
          </NuxtLink>
        </div>
      </main>
    </BaseContainer>
  </section>
</template>
