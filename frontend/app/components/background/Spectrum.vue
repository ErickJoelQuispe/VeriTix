<template>
  <div aria-hidden="true" class="vtx-bg-grid pointer-events-none fixed inset-0 -z-20" />
</template>

<style scoped>
.vtx-bg-grid {
  inset: -40vh -20vw;
  width: 140vw;
  height: 180vh;
  opacity: 0.2;
  background-image:
    linear-gradient(var(--color-border-default) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border-default) 1px, transparent 1px);
  background-size: 100px 100px;
  transform: perspective(900px) rotateX(64deg) rotateZ(-18deg);
  transform-origin: center;
  mask-image: radial-gradient(circle at center, black 0 48%, transparent 82%);
  -webkit-mask-image: radial-gradient(circle at center, black 0 48%, transparent 82%);
  mix-blend-mode: screen;
}
</style>
