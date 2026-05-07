<script setup lang="ts">
const props = defineProps<{
  duration?: string
  direction?: 'alternate' | 'alternate-reverse' | 'normal' | 'reverse'
}>()
</script>

<template>
  <div aria-hidden="true" class="vtx-bg-spectrum pointer-events-none fixed -z-20" />
</template>

<style scoped>
.vtx-bg-spectrum {
  inset: -44% -22% auto;
  height: 58rem;
  background: conic-gradient(
    from 112deg at 48% 44%,
    rgb(44 189 230 / 0.22),
    rgb(255 255 255 / 0) 24%,
    rgb(239 170 71 / 0.26) 48%,
    rgb(255 255 255 / 0) 70%,
    rgb(215 66 97 / 0.22),
    rgb(255 255 255 / 0)
  );
  filter: blur(56px);
  animation: spectrum-drift v-bind('props.duration || "22s"') ease-in-out infinite
    v-bind('props.direction || "alternate"');
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .vtx-bg-spectrum {
    animation: none;
  }
}

@keyframes spectrum-drift {
  from {
    transform: translate3d(-2%, 0, 0) rotate(0deg);
  }

  to {
    transform: translate3d(2%, -2%, 0) rotate(10deg);
  }
}
</style>
