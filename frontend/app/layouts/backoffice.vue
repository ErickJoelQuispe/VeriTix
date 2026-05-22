<template>
  <div class="relative isolate min-h-screen text-default">
    <BackdropsPageBackdrop />
    <BackdropsPerspectiveGrid />

    <div class="relative z-10 flex min-h-screen flex-col">
      <LayoutBackofficeHeader />
      <main class="flex-1">
        <slot />
      </main>
    </div>

    <UiConfirmDialog />
  </div>
</template>
