<template>
  <div class="relative isolate min-h-screen text-default">
    <BackgroundBase />
    <BackgroundSpectrum />
    <BackgroundTexture />

    <div class="relative z-10 min-h-screen">
      <LayoutHeader />
      <slot />
    </div>
  </div>
</template>
