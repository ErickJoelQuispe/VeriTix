<template>
  <div aria-hidden="true" class="vtx-bg-grid pointer-events-none fixed inset-0 -z-20" />
</template>

<style scoped>
.vtx-bg-grid {
  inset: -40vh -20vw;
  width: 140vw;
  height: 180vh;
  opacity: 0.18;
  background-image:
    linear-gradient(color-mix(in oklch, var(--color-highlighted) 20%, var(--color-border-default)) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in oklch, var(--color-highlighted) 20%, var(--color-border-default)) 1px, transparent 1px);
  background-size: 96px 96px;
  transform: perspective(900px) rotateX(64deg) rotateZ(-18deg);
  transform-origin: center;
  mask-image: radial-gradient(circle at center, black 0 52%, transparent 86%);
  -webkit-mask-image: radial-gradient(circle at center, black 0 52%, transparent 86%);
  mix-blend-mode: screen;
}
</style>
