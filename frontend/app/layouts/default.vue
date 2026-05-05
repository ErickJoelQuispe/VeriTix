<template>
  <div class="relative isolate min-h-screen text-default">
    <BackgroundBase />
    <BackgroundSpectrum />
    <BackgroundTexture />

    <div class="relative z-10 flex min-h-screen flex-col">
      <LayoutHeader />

      <BaseMain class="flex flex-1 flex-col pb-6">
        <slot />
      </BaseMain>

      <LayoutFooter />
    </div>
  </div>
</template>
