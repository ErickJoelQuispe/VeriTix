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
          Define your<br>
          frequency.
        </h3>

        <div v-if="isBackofficeRoute" class="grid gap-10 sm:grid-cols-2 lg:ml-auto lg:grid-cols-3 lg:gap-16">
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Backoffice
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/backoffice">
                  Dashboard
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/backoffice/events">
                  Events
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Entities
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/backoffice/artists">
                  Artists
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/backoffice/venues">
                  Venues
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/backoffice/users">
                  Users
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Public
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/">
                  Home
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/events">
                  Events
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div v-else class="grid gap-10 sm:grid-cols-2 lg:ml-auto lg:grid-cols-3 lg:gap-16">
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Discover
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/events">
                  All Events
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/events">
                  Venues
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/events">
                  Artists
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Platform
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/">
                  The Ledger
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/login">
                  For Creators
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/events">
                  Transfer Protocol
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <p class="mb-4 text-xs tracking-[0.12em] text-muted uppercase">
              Company
            </p>
            <ul class="space-y-3 text-sm text-toned">
              <li>
                <NuxtLink to="/">
                  About
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/">
                  Manifesto
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/">
                  Support
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-14 flex items-center justify-between border-t border-default/75 pt-6 text-xs tracking-wide text-muted uppercase">
        <p class="font-display text-lg normal-case text-highlighted">
          VeriTix
        </p>
        <p>© {{ currentYear }} Veritix infrastructure</p>
      </div>
    </BaseContainer>
  </footer>
</template>
