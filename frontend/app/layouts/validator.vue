<template>
  <div class="relative isolate min-h-screen text-default">
    <BackdropsPageBackdrop />
    <BackdropsPerspectiveGrid />

    <div class="relative z-10 min-h-screen">
      <LayoutValidatorHeader />
      <slot />
    </div>
  </div>
</template>
