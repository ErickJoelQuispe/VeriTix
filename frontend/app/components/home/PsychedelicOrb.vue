<script setup lang="ts">
const rays = Array.from({ length: 10 }, (_, index) => {
  return {
    id: index,
    rotate: `${index * 25}deg`,
    delay: `${index * 120}ms`,
  }
})

const satellites = [
  { id: 'a', angle: '18deg', delay: '0ms' },
  { id: 'b', angle: '142deg', delay: '520ms' },
  { id: 'c', angle: '258deg', delay: '940ms' },
]
</script>

<template>
  <div class="orb-wrapper relative mx-auto aspect-square w-full max-w-md">
    <div class="orb-sigil orb-sigil--outer" />
    <div class="orb-sigil orb-sigil--offset" />
    <div class="orb-halo" />

    <div class="orb-rays">
      <span
        v-for="ray in rays"
        :key="ray.id"
        class="orb-ray"
        :style="{ '--ray-rotate': ray.rotate, '--ray-delay': ray.delay }"
      />
    </div>

    <div class="orb-core" />
    <div class="orb-ring orb-ring--outer" />
    <div class="orb-ring orb-ring--inner" />
    <div class="orb-ring orb-ring--accent" />
    <div class="orb-ring orb-ring--soft" />
    <div class="orb-comet orb-comet--a" />
    <div class="orb-comet orb-comet--b" />
    <div class="orb-lattice" />
    <div class="orb-triangle" />
    <div class="orb-hex" />

    <div class="orb-satellites">
      <span
        v-for="satellite in satellites"
        :key="satellite.id"
        class="orb-satellite"
        :style="{ '--sat-angle': satellite.angle, '--sat-delay': satellite.delay }"
      />
    </div>
  </div>
</template>

<style scoped>
.orb-wrapper {
  transform: rotate(-5deg);
}

.orb-halo {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background:
    radial-gradient(circle at 30% 28%, rgb(239 170 71 / 0.24), rgb(255 255 255 / 0) 52%),
    radial-gradient(circle at 72% 68%, rgb(20 128 188 / 0.22), rgb(255 255 255 / 0) 54%);
  animation: orbit-breathe 5.8s ease-in-out infinite;
}

.orb-sigil {
  position: absolute;
  pointer-events: none;
  border: 1px solid rgb(255 255 255 / 0.22);
  background: linear-gradient(130deg, rgb(239 170 71 / 0.08), rgb(20 128 188 / 0.08), rgb(240 100 127 / 0.08));
}

.orb-sigil--outer {
  inset: -3%;
  clip-path: polygon(50% 0%, 78% 11%, 99% 47%, 86% 83%, 52% 100%, 20% 90%, 0% 52%, 12% 15%);
  animation: sigil-tilt 12s ease-in-out infinite;
}

.orb-sigil--offset {
  top: 6%;
  left: 4%;
  height: 88%;
  width: 88%;
  border-color: rgb(255 255 255 / 0.16);
  clip-path: polygon(44% 0%, 100% 36%, 88% 100%, 36% 92%, 0% 50%);
  opacity: 0.48;
  animation: sigil-tilt 9s ease-in-out infinite reverse;
}

.orb-core {
  position: absolute;
  inset: 22%;
  border-radius: 9999px;
  background: radial-gradient(circle at 32% 30%, rgb(239 170 71 / 0.92), rgb(44 189 230 / 0.7), rgb(17 21 38 / 0.84));
  box-shadow:
    0 0 42px rgb(239 170 71 / 0.38),
    inset 0 0 25px rgb(255 255 255 / 0.12);
}

.orb-ring {
  position: absolute;
  border-radius: 52% 48% 56% 44% / 46% 54% 42% 58%;
  border: 1px solid rgb(237 215 183 / 0.35);
  animation: orbit-rotate 17s linear infinite;
}

.orb-ring--outer {
  inset: 5%;
}

.orb-ring--inner {
  inset: 15%;
  border-radius: 47% 53% 49% 51% / 57% 43% 55% 45%;
  animation-duration: 14s;
  animation-direction: reverse;
}

.orb-ring--accent {
  inset: 0;
  border-color: rgb(240 100 127 / 0.45);
  border-radius: 58% 42% 51% 49% / 44% 56% 40% 60%;
  animation-duration: 21s;
}

.orb-ring--soft {
  inset: 10%;
  border-style: dashed;
  border-color: rgb(246 248 255 / 0.3);
  animation-duration: 27s;
}

.orb-lattice {
  position: absolute;
  inset: 12%;
  border-radius: 9999px;
  mask-image: radial-gradient(circle at center, transparent 24%, black 24%);
  background-image:
    repeating-linear-gradient(
      0deg,
      rgb(255 255 255 / 0.15),
      rgb(255 255 255 / 0.15) 1px,
      transparent 1px,
      transparent 18px
    ),
    repeating-linear-gradient(
      90deg,
      rgb(255 255 255 / 0.1),
      rgb(255 255 255 / 0.1) 1px,
      transparent 1px,
      transparent 18px
    );
  opacity: 0.3;
}

.orb-comet {
  --comet-angle: 0deg;
  --drift-x: -8px;
  --drift-y: 5px;
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
  transform: rotate(var(--comet-angle));
}

.orb-comet--a {
  top: 15%;
  right: 6%;
  height: 0.85rem;
  width: 3.5rem;
  --comet-angle: 26deg;
  background: linear-gradient(90deg, rgb(255 255 255 / 0), rgb(239 170 71 / 0.92));
  animation: comet-drift 6.2s ease-in-out infinite;
}

.orb-comet--b {
  bottom: 16%;
  left: 3%;
  height: 0.7rem;
  width: 2.7rem;
  --comet-angle: -20deg;
  --drift-x: 6px;
  --drift-y: -4px;
  background: linear-gradient(90deg, rgb(255 255 255 / 0), rgb(20 128 188 / 0.9));
  animation: comet-drift 7.1s ease-in-out infinite reverse;
}

.orb-triangle {
  position: absolute;
  inset: 9%;
  clip-path: polygon(50% 6%, 93% 84%, 7% 84%);
  border: 1px solid rgb(246 248 255 / 0.25);
  animation: orbit-pulse 7s ease-in-out infinite;
}

.orb-hex {
  position: absolute;
  inset: 19%;
  clip-path: polygon(25% 7%, 75% 7%, 96% 50%, 75% 93%, 25% 93%, 4% 50%);
  border: 1px solid rgb(239 170 71 / 0.34);
  animation: orbit-pulse 8.2s ease-in-out infinite reverse;
}

.orb-rays {
  position: absolute;
  inset: 0;
  opacity: 0.88;
}

.orb-ray {
  --ray-rotate: 0deg;
  --ray-delay: 0ms;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40%;
  height: 1px;
  transform-origin: 0 0;
  transform: rotate(var(--ray-rotate));
  background: linear-gradient(90deg, rgb(255 255 255 / 0), rgb(255 255 255 / 0.45), rgb(255 255 255 / 0));
  opacity: 0.28;
  animation: ray-flicker 6.2s ease-in-out infinite;
  animation-delay: var(--ray-delay);
}

.orb-satellites {
  position: absolute;
  inset: 0;
  animation: orbit-rotate 24s linear infinite reverse;
}

.orb-satellite {
  --sat-angle: 0deg;
  --sat-delay: 0ms;
  position: absolute;
  top: 50%;
  left: 50%;
  height: 0.7rem;
  width: 0.7rem;
  border-radius: 9999px;
  transform: rotate(var(--sat-angle)) translateY(-10.4rem);
  background: radial-gradient(circle at 40% 40%, rgb(255 255 255 / 0.9), rgb(44 189 230 / 0.68));
  box-shadow: 0 0 18px rgb(44 189 230 / 0.65);
  animation: sat-pulse 5.4s ease-in-out infinite;
  animation-delay: var(--sat-delay);
}

@keyframes orbit-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes orbit-pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.03) rotate(-5deg);
  }
}

@keyframes orbit-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
  }
}

@keyframes ray-flicker {
  0%,
  100% {
    opacity: 0.18;
  }
  45% {
    opacity: 0.42;
  }
  60% {
    opacity: 0.2;
  }
}

@keyframes sat-pulse {
  0%,
  100% {
    transform: rotate(var(--sat-angle)) translateY(-10.4rem) scale(1);
  }
  50% {
    transform: rotate(var(--sat-angle)) translateY(-10.4rem) scale(1.26);
  }
}

@keyframes comet-drift {
  0%,
  100% {
    opacity: 0.5;
    transform: translate3d(0, 0, 0) rotate(var(--comet-angle));
  }
  50% {
    opacity: 0.95;
    transform: translate3d(var(--drift-x), var(--drift-y), 0) rotate(var(--comet-angle));
  }
}

@keyframes sigil-tilt {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(4deg) scale(1.02);
  }
}

@media (prefers-reduced-motion: reduce) {
  .orb-sigil,
  .orb-ring,
  .orb-halo,
  .orb-rays,
  .orb-satellites,
  .orb-satellite,
  .orb-comet,
  .orb-triangle,
  .orb-hex {
    animation: none;
  }

  .orb-wrapper {
    transform: none;
  }
}
</style>
