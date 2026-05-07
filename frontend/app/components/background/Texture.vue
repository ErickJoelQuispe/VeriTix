<template>
  <div
    aria-hidden="true"
    class="vtx-starfield pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    style="contain: strict;"
  >
    <!-- Base noise & blobs -->
    <div class="vtx-noise" />
    <div class="vtx-constellation vtx-constellation--left" />
    <div class="vtx-constellation vtx-constellation--right" />
    <div class="vtx-constellation vtx-constellation--bottom" />

    <!-- Cosmic Geometry Layer -->
    <div class="vtx-cosmic-geometry">
      <!-- Sacred rings with subtle interference -->
      <div class="vtx-sacred-ring vtx-sacred-ring--outer" />
      <div class="vtx-sacred-ring vtx-sacred-ring--inner" />
      <div class="vtx-sacred-ring vtx-sacred-ring--core" />

      <!-- Hexagonal / Triangular fractals -->
      <div class="vtx-fractal-hex" />
    </div>
  </div>
</template>

<style scoped>
.vtx-starfield {
  --vtx-electric: 20 128 188;
  --vtx-auric: 239 170 71;
  --vtx-crimson: 215 66 97;

  background-image:
    radial-gradient(circle at 20% 20%, rgb(255 255 255 / 0.35) 0.4px, transparent 0.4px),
    radial-gradient(circle at 70% 60%, rgb(255 255 255 / 0.28) 0.5px, transparent 0.5px),
    radial-gradient(circle at 40% 80%, rgb(255 255 255 / 0.24) 0.5px, transparent 0.5px);
  background-size: 120px 120px;
}

.vtx-noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.16;
  background-image: radial-gradient(rgb(255 255 255 / 0.12) 0.6px, transparent 0.6px);
  background-size: 3px 3px;
  mix-blend-mode: soft-light;
}

.vtx-constellation {
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
  filter: blur(68px);
}

.vtx-constellation--left {
  top: -8rem;
  left: -10rem;
  height: 24rem;
  width: 24rem;
  background: radial-gradient(circle at 50% 50%, rgb(var(--vtx-electric) / 0.28), rgb(255 255 255 / 0));
  animation: drift-slow 14s ease-in-out infinite alternate;
  will-change: transform, opacity;
}

.vtx-constellation--right {
  top: 8%;
  right: -11rem;
  height: 28rem;
  width: 28rem;
  background: radial-gradient(circle at 50% 50%, rgb(var(--vtx-auric) / 0.24), rgb(255 255 255 / 0));
  animation: drift-slow 16s ease-in-out infinite alternate-reverse;
  will-change: transform, opacity;
}

.vtx-constellation--bottom {
  bottom: -10rem;
  left: 50%;
  height: 24rem;
  width: 24rem;
  transform: translateX(-50%);
  background: radial-gradient(circle at 50% 50%, rgb(var(--vtx-crimson) / 0.26), rgb(255 255 255 / 0));
}

/* Cosmic Geometry container */
.vtx-cosmic-geometry {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  height: 100vh;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.vtx-sacred-ring {
  position: absolute;
  border-radius: 9999px;
  border: 1px solid rgb(255 255 255 / 0.08);
  will-change: transform;
}

.vtx-sacred-ring--outer {
  height: min(45rem, 90vw);
  width: min(45rem, 90vw);
  border-style: dashed;
  animation: rotate-slow 90s linear infinite;
  box-shadow: inset 0 0 40px rgb(var(--vtx-electric) / 0.05);
}

.vtx-sacred-ring--inner {
  height: min(34rem, 72vw);
  width: min(34rem, 72vw);
  box-shadow:
    0 0 0 12px rgb(255 255 255 / 0.02),
    inset 0 0 20px rgb(var(--vtx-crimson) / 0.05);
  animation: rotate-slow-reverse 60s linear infinite;
}

.vtx-sacred-ring--core {
  height: min(20rem, 40vw);
  width: min(20rem, 40vw);
  border: 2px solid rgb(var(--vtx-auric) / 0.1);
  animation: rotate-slow 45s linear infinite;
}

/* Hexagonal Fractal */
.vtx-fractal-hex {
  position: absolute;
  width: min(26rem, 55vw);
  height: min(26rem, 55vw);
  border: 1px solid rgb(var(--vtx-electric) / 0.15);
  transform: rotate(30deg);
  animation: breathe-rotate 30s ease-in-out infinite alternate;
  will-change: transform, opacity;
}
.vtx-fractal-hex::before,
.vtx-fractal-hex::after {
  content: '';
  position: absolute;
  inset: -1px;
  border: 1px solid rgb(var(--vtx-crimson) / 0.12);
}
.vtx-fractal-hex::before {
  transform: rotate(30deg);
}
.vtx-fractal-hex::after {
  transform: rotate(60deg);
}

@media (prefers-reduced-motion: reduce) {
  .vtx-constellation--left,
  .vtx-constellation--right,
  .vtx-sacred-ring--outer,
  .vtx-sacred-ring--inner,
  .vtx-sacred-ring--core,
  .vtx-fractal-hex {
    animation: none !important;
  }
}

@keyframes drift-slow {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, -3%, 0);
  }
}

@keyframes rotate-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes rotate-slow-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes breathe-rotate {
  0% {
    transform: rotate(30deg) scale(0.95);
    opacity: 0.6;
  }
  100% {
    transform: rotate(45deg) scale(1.05);
    opacity: 1;
  }
}
</style>
