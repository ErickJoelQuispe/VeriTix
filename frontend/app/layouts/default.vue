<template>
  <div class="relative isolate min-h-screen text-default">
    <BackdropsPageBackdrop />
    <BackdropsPerspectiveGrid />

    <div class="relative z-10 flex min-h-screen flex-col">
      <LayoutHeader />
      <main class="flex-1">
        <slot />
      </main>
      <LayoutFooter />
    </div>

    <UiConfirmDialog />
  </div>
</template>
