<template>
  <div aria-hidden="true" class="vtx-bg-grid pointer-events-none fixed inset-0 -z-20" />
</template>

<style scoped>
.vtx-bg-grid {
  inset: -40vh -20vw;
  width: 140vw;
  height: 180vh;
  opacity: 0.24;
  background-image:
    linear-gradient(color-mix(in oklch, var(--color-highlighted) 24%, var(--color-border-default)) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in oklch, var(--color-highlighted) 24%, var(--color-border-default)) 1px, transparent 1px);
  background-size: 88px 88px;
  transform: perspective(900px) rotateX(64deg) rotateZ(-18deg);
  transform-origin: center;
  mask-image: radial-gradient(circle at 40% 24%, black 0 70%, transparent 96%);
  -webkit-mask-image: radial-gradient(circle at 40% 24%, black 0 70%, transparent 96%);
  mix-blend-mode: screen;
}
</style>
