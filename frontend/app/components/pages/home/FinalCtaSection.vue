<template>
  <UiSectionContainer id="features">
    <div class="grid gap-8 rounded-2xl border border-default/70 bg-elevated/40 p-6 lg:grid-cols-[1.1fr_.9fr] lg:p-8">
      <div class="space-y-4">
        <UiMetaLabel tone="accent">
          Why VeriTix
        </UiMetaLabel>
        <h2 class="font-display text-4xl leading-[0.95] text-highlighted sm:text-5xl">
          Keep the next show close.
        </h2>
        <p class="max-w-2xl text-sm leading-relaxed text-toned sm:text-base">
          Browse, save, and enter without extra steps. From discovery to checkout, every module keeps the path short.
        </p>
        <BaseButton kind="secondary" to="/events" size="sm" class="w-fit">
          Browse events
        </BaseButton>
      </div>

      <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <article class="rounded-xl border border-default/65 bg-default/20 px-4 py-3">
          <p class="text-xs tracking-[0.12em] text-muted uppercase">
            Discover
          </p>
          <p class="mt-1 text-lg font-semibold text-highlighted">
            Fast
          </p>
        </article>
        <article class="rounded-xl border border-default/65 bg-default/20 px-4 py-3">
          <p class="text-xs tracking-[0.12em] text-muted uppercase">
            Save
          </p>
          <p class="mt-1 text-lg font-semibold text-highlighted">
            Ready
          </p>
        </article>
        <article class="rounded-xl border border-default/65 bg-default/20 px-4 py-3">
          <p class="text-xs tracking-[0.12em] text-muted uppercase">
            Enter
          </p>
          <p class="mt-1 text-lg font-semibold text-highlighted">
            Short
          </p>
        </article>
      </div>
    </div>
  </UiSectionContainer>
</template>
