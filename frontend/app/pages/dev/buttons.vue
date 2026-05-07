<template>
  <main class="py-16 sm:py-20">
    <BaseContainer>
      <div class="max-w-3xl space-y-10">
        <div class="space-y-3">
          <p class="vtx-eyebrow">
            UI / Buttons
          </p>
          <h1 class="font-display text-5xl leading-none text-highlighted sm:text-6xl">
            Button variants.
          </h1>
          <p class="max-w-2xl text-base leading-relaxed text-toned">
            Primary, secondary, outlined, and reversed — aligned with the current open-design direction.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BaseButton variant="primary">
            Primary
          </BaseButton>
          <BaseButton variant="secondary">
            Secondary
          </BaseButton>
          <BaseButton variant="outlined">
            Outlined
          </BaseButton>
          <BaseButton variant="reversed">
            Reversed
          </BaseButton>
        </div>

        <div class="grid gap-4 rounded-2xl border border-default/60 bg-elevated/40 p-6 sm:grid-cols-2 xl:grid-cols-4">
          <BaseButton variant="primary" leading-icon="i-lucide-sparkles">
            Primary
          </BaseButton>
          <BaseButton variant="secondary" leading-icon="i-lucide-diamond">
            Secondary
          </BaseButton>
          <BaseButton variant="outlined" leading-icon="i-lucide-orbit">
            Outlined
          </BaseButton>
          <BaseButton variant="reversed" leading-icon="i-lucide-arrow-right">
            Reversed
          </BaseButton>
        </div>
      </div>
    </BaseContainer>
  </main>
</template>
