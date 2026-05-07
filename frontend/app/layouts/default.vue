<template>
  <div class="relative isolate min-h-screen text-default">
    <BackgroundBase />
    <BackgroundSpectrum />

    <div class="relative z-10 min-h-screen">
      <LayoutHeader />
      <slot />
      <LayoutFooter />
    </div>
  </div>
</template>
