<template>
  <div aria-hidden="true" class="vtx-bg-grid pointer-events-none fixed inset-0 -z-20" />
</template>

<style scoped>
.vtx-bg-grid {
  inset: -49vh -17vw;
  width: 119vw;
  height: 140vh;
  opacity: 0.22;
  background-image:
    linear-gradient(color-mix(in oklch, var(--color-highlighted) 24%, var(--color-border-default)) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in oklch, var(--color-highlighted) 24%, var(--color-border-default)) 1px, transparent 1px);
  background-size: 88px 88px;
  transform: perspective(1100px) rotateX(66deg) rotateZ(-20deg);
  transform-origin: center;
  mask-image: radial-gradient(circle at 40% 24%, black 0 70%, transparent 96%);
  -webkit-mask-image: radial-gradient(circle at 40% 24%, black 0 70%, transparent 96%);
  mix-blend-mode: screen;
}
</style>
